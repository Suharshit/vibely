// ============================================================
// apps/web/app/api/events/route.ts
// ============================================================
// GET  /api/events  — list all events the current user belongs to
// POST /api/events  — create a new event
//
// WHY list by event_members and not events.host_id?
// A user can be a contributor or viewer on events they didn't
// create. Querying event_members gives us ALL events the user
// is part of — hosted or joined — in a single query.
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createEventSchema } from "@shared/validation/event.schemas";
import { generateInviteToken, defaultExpiresAt } from "@shared/utils/invite";

// ── GET — list user's events ─────────────────────────────────

export async function GET() {
  const supabase = await createClient();

  // Step 1: authenticate
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Step 2: fetch events through the membership join table
  // We join: event_members → events → users (for host info)
  // and get the member count as a subquery aggregate.
  const { data: events, error } = await supabase
    .from("event_members")
    .select(
      `
      role,
      joined_at,
      events (
        id,
        title,
        description,
        cover_image_url,
        host_id,
        invite_token,
        event_date,
        expires_at,
        status,
        upload_permission,
        created_at,
        host:users!host_id (
          id,
          name,
          avatar_url
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  if (error) {
    console.error("[GET /api/events]", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }

  // Flatten: unwrap the nested events object and attach the user's role
  const flattened = events
    .map(({ role, events: event }) => {
      if (!event) return null;
      return { ...event, user_role: role };
    })
    .filter(Boolean);

  return NextResponse.json({ events: flattened });
}

// ── POST — create a new event ────────────────────────────────

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate the request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    // Return all validation errors at once so the client can
    // highlight every invalid field in one round-trip
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { title, description, event_date, expires_at, upload_permission } =
    parsed.data;

  // Generate a unique invite token — retry on collision (extremely rare)
  // In practice, with 64^12 combinations, collisions won't happen, but
  // defensive retry loops are good practice for uniqueness constraints.
  let inviteToken: string = "";
  let attempts = 0;

  while (attempts < 3) {
    const candidate = generateInviteToken();
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("invite_token", candidate)
      .single();

    if (!existing) {
      inviteToken = candidate;
      break;
    }
    attempts++;
  }

  if (!inviteToken) {
    return NextResponse.json(
      { error: "Failed to generate unique token" },
      { status: 500 }
    );
  }

  const eventDate = new Date(event_date);
  const expiresAtDate = expires_at
    ? new Date(expires_at)
    : defaultExpiresAt(eventDate);

  const { data: event, error: insertError } = await supabase
    .from("events")
    .insert({
      title,
      description: description ?? null,
      host_id: user.id,
      invite_token: inviteToken,
      event_date: eventDate.toISOString(),
      expires_at: expiresAtDate.toISOString(),
      upload_permission: upload_permission ?? "open",
      status: "active",
    })
    .select()
    .single();

  if (insertError) {
    console.error("[POST /api/events]", insertError);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }

  // Note: the on_event_created DB trigger automatically adds the
  // host to event_members with role='host' — we don't need to do
  // that here. This is why DB-level triggers are powerful: they
  // keep data consistent even if the API has a bug.

  return NextResponse.json({ event }, { status: 201 });
}

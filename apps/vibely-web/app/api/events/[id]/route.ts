// ============================================================
// apps/web/app/api/events/[id]/route.ts
// ============================================================
// GET    /api/events/:id  — fetch a single event with members
// PATCH  /api/events/:id  — update event (host only)
// DELETE /api/events/:id  — delete event (host only)
//
// WHY check membership in the API when RLS already does it?
// RLS returns empty results for unauthorized access but gives
// a generic "not found" response. Checking explicitly lets us
// return the correct HTTP status: 403 for "you don't have
// permission" vs 404 for "this event doesn't exist" — important
// for good API design and debugging.
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateEventSchema } from "@shared/validation/event.schemas";

type RouteParams = { params: Promise<{ id: string }> };

// ── Shared: get authenticated user + verify membership ───────

async function getAuthAndMembership(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return {
      error: "Unauthorized",
      status: 401,
      supabase,
      user: null,
      membership: null,
    };

  // Get this user's membership row for the event
  const { data: membership } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  return { error: null, status: 200, supabase, user, membership };
}

// ── GET ──────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const { error, status, supabase, user, membership } =
    await getAuthAndMembership(id);

  if (error) return NextResponse.json({ error }, { status });
  if (!membership)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Fetch the full event with host info and member list
  const { data: event, error: fetchError } = await supabase
    .from("events")
    .select(
      `
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
      updated_at,
      host:users!host_id (
        id,
        name,
        avatar_url
      ),
      event_members (
        id,
        role,
        joined_at,
        is_guest,
        user:users (
          id,
          name,
          avatar_url
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (fetchError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({
    event,
    user_role: membership.role, // Include the requester's role for UI permissions
  });
}

// ── PATCH ────────────────────────────────────────────────────

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { error, status, supabase, membership } =
    await getAuthAndMembership(id);

  if (error) return NextResponse.json({ error }, { status });
  if (!membership)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Only the host can edit event details
  if (membership.role !== "host") {
    return NextResponse.json(
      { error: "Only the event host can edit this event" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { data: event, error: updateError } = await supabase
    .from("events")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("[PATCH /api/events/:id]", updateError);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }

  return NextResponse.json({ event });
}

// ── DELETE ───────────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const { error, status, supabase, membership } =
    await getAuthAndMembership(id);

  if (error) return NextResponse.json({ error }, { status });
  if (!membership)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  if (membership.role !== "host") {
    return NextResponse.json(
      { error: "Only the event host can delete this event" },
      { status: 403 }
    );
  }

  // Cascade: photos, event_members, guest_sessions are deleted
  // automatically via ON DELETE CASCADE in the DB schema.
  // We don't need to manually clean them up here.
  // R2 photo cleanup is handled by the cron job in Phase 12.
  const { error: deleteError } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("[DELETE /api/events/:id]", deleteError);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

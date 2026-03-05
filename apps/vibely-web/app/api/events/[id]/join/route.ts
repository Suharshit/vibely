// ============================================================
// apps/web/app/api/events/[id]/join/route.ts
// ============================================================
// POST /api/events/:id/join
//
// Flow:
//  1. Authenticated user visits /join/:token
//  2. Client resolves the token to an event ID via the invite route
//  3. Client calls this endpoint with the token to join
//  4. We verify token matches the event ID (prevents token substitution)
//  5. We check if they're already a member (idempotent)
//  6. Insert into event_members with role='contributor'
//
// WHY require the token even though the user has the event ID?
// The invite token is the proof of authorization. Someone could
// guess a UUID event ID but they can't guess the invite token.
// Always validate the token even when you have the ID.
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { id: eventId } = await params;
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse the invite token from the request body
  let token: string | undefined;
  try {
    const body = await request.json();
    token = body.invite_token;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: "invite_token is required" },
      { status: 400 }
    );
  }

  // Verify the event exists, is active, AND the token matches the event ID
  // This prevents a user from using a valid token for event A to join event B
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, title, status, invite_token, upload_permission")
    .eq("id", eventId)
    .eq("invite_token", token) // Both conditions must match
    .single();

  if (eventError || !event) {
    return NextResponse.json(
      { error: "Invalid or expired invite link" },
      { status: 404 }
    );
  }

  if (event.status !== "active") {
    return NextResponse.json(
      { error: "This event has ended and is no longer accepting new members" },
      { status: 410 } // 410 Gone — intentional, not 404
    );
  }

  // Check existing membership (idempotent — joining twice is fine)
  const { data: existingMember } = await supabase
    .from("event_members")
    .select("id, role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    // Already a member — return current membership (not an error)
    return NextResponse.json({
      message: "Already a member",
      event,
      role: existingMember.role,
    });
  }

  // Join the event as a contributor
  const { error: joinError } = await supabase.from("event_members").insert({
    event_id: eventId,
    user_id: user.id,
    role: "contributor",
    is_guest: false,
  });

  if (joinError) {
    console.error("[POST /api/events/:id/join]", joinError);
    return NextResponse.json(
      { error: "Failed to join event" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, event, role: "contributor" },
    { status: 201 }
  );
}

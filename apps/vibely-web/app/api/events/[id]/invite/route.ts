// ============================================================
// apps/web/app/api/events/[id]/invite/route.ts
// ============================================================
// GET /api/events/:id/invite?token=XXXX
//
// WHY does this route exist?
// The join page (/join/:token) needs to display event info
// BEFORE the user decides to join — name, date, host — so
// they know what they're joining.
//
// This endpoint is intentionally unauthenticated: even
// logged-out users (and guests) see the event preview page.
// We limit the fields returned to only what's needed for
// the preview — no member list, no photos.
//
// Note: we also use the admin client here because RLS on events
// only permits reads by event members. An unjoined user isn't a
// member yet, so the normal client would return nothing.
// We scope this deliberately with strict field selection.
// ============================================================

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  // Use admin client to bypass RLS — we need to show event info
  // to non-members on the invite preview page.
  const supabase = createAdminClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(
      `
      id,
      title,
      description,
      cover_image_url,
      event_date,
      expires_at,
      status,
      upload_permission,
      invite_token,
      host:users!host_id (
        id,
        name,
        avatar_url
      )
    `
    )
    .eq("id", id)
    .eq("invite_token", token)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }

  // Only return preview data for active events
  if (event.status !== "active") {
    return NextResponse.json(
      { error: "This event has ended" },
      { status: 410 }
    );
  }

  // Count members (show social proof on invite page)
  const { count: memberCount } = await supabase
    .from("event_members")
    .select("id", { count: "exact", head: true })
    .eq("event_id", id);

  return NextResponse.json({
    event: {
      ...event,
      member_count: memberCount ?? 0,
    },
  });
}

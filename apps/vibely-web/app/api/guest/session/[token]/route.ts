/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================
// apps/web/app/api/guest/session/[token]/route.ts
// ============================================================
// GET /api/guest/session/:token
//
// Called on page load when a returning guest has a stored token.
// Validates the token and returns the guest + event info so the
// upload page can show the right event and greeting.
// ============================================================

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { token } = await params;
  const adminSupabase = createAdminClient();

  if (!token || token.length < 20) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const { data: session } = await adminSupabase
    .from("guest_sessions")
    .select(
      `
      id, session_token, display_name, event_id, created_at,
      event:events (
        id, title, status, event_date, expires_at, upload_permission,
        host:users!host_id ( name, avatar_url )
      )
    `
    )
    .eq("session_token", token)
    .single();

  if (!session) {
    return NextResponse.json(
      { error: "Session not found or expired" },
      { status: 404 }
    );
  }

  const event = session.event as any;

  return NextResponse.json({
    session_token: session.session_token,
    display_name: session.display_name,
    event_id: session.event_id,
    event: {
      id: event.id,
      title: event.title,
      status: event.status,
      event_date: event.event_date,
      expires_at: event.expires_at,
      upload_permission: event.upload_permission,
      host: event.host,
    },
  });
}

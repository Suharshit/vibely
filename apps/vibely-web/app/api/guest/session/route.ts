// ============================================================
// apps/web/app/api/guest/session/route.ts
// ============================================================
// POST /api/guest/session
//
// Creates a guest session for uploading photos without an account.
// Guests enter their name and get a session token stored in
// localStorage. The token is used to authenticate photo uploads.
// ============================================================

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateGuestToken } from "@shared/utils/invite";
import { guestSessionRateLimit } from "@/lib/utils/rate-limit";
import { z } from "zod";

const schema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  display_name: z.string().min(1).max(50).trim(),
});

export async function POST(request: Request) {
  const adminSupabase = createAdminClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  // Rate limit: 5 guest sessions per IP per 15 minutes
  const rl = await guestSessionRateLimit(request);
  if (!rl.success) return rl.response!;

  const { event_id, display_name } = parsed.data;

  const { data: event } = await adminSupabase
    .from("events")
    .select("id, title, status, upload_permission, expires_at")
    .eq("id", event_id)
    .single();

  if (!event)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.status !== "active")
    return NextResponse.json(
      { error: "This event has ended." },
      { status: 410 }
    );
  if (event.upload_permission === "restricted")
    return NextResponse.json(
      { error: "This event requires an account." },
      { status: 403 }
    );

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const session_token = generateGuestToken();

  const { data: session, error } = await adminSupabase
    .from("guest_sessions")
    .insert({
      event_id,
      session_token,
      display_name: display_name.trim(),
      ip_address: ip,
    })
    .select()
    .single();

  if (error) {
    console.error("[guest-session] Failed to insert:", error.message, error.details);
    return NextResponse.json(
      { error: "Failed to create guest session" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      session_token: session.session_token,
      display_name: session.display_name,
      event_id: session.event_id,
      event_title: event.title,
    },
    { status: 201 }
  );
}

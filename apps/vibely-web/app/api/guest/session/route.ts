// ============================================================
// apps/web/app/api/guest/session/route.ts
// ============================================================
// POST /api/guest/session
//
// Called when a guest enters their name on the join page.
// Creates a guest_sessions row and returns the session token
// which the client stores in localStorage / AsyncStorage.
//
// WHY store the token client-side instead of a cookie?
// Cookies require SameSite/Secure configuration and don't work
// cleanly in React Native. A bearer token in storage works
// identically on web and mobile — one pattern, both platforms.
//
// WHY do we need a display_name?
// When other event members see the gallery, they should know
// who uploaded each photo. "Guest: Maria" is far better UX
// than "Anonymous". We don't need an email — just a name.
// ============================================================

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateGuestToken } from "@shared/utils/invite";
import { z } from "zod";

const schema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or fewer")
    .trim(),
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

  const { event_id, display_name } = parsed.data;

  // Verify the event exists, is active, and allows guest uploads
  const { data: event } = await adminSupabase
    .from("events")
    .select("id, title, status, upload_permission, expires_at")
    .eq("id", event_id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.status !== "active") {
    return NextResponse.json(
      { error: "This event has ended and is no longer accepting uploads." },
      { status: 410 }
    );
  }

  if (event.upload_permission === "restricted") {
    return NextResponse.json(
      { error: "This event requires an account to upload photos." },
      { status: 403 }
    );
  }

  // Get client IP for rate limiting in Phase 11
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  // Generate a cryptographically random session token
  const session_token = generateGuestToken(); // 32-char nanoid

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
    console.error("[POST /api/guest/session]", error);
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

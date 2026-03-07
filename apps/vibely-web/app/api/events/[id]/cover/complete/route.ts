// ============================================================
// apps/web/app/api/events/[id]/cover/complete/route.ts
// ============================================================
// POST /api/events/:id/cover/complete
// After upload, saves the public cover URL to events table.
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

const schema = z.object({ storage_key: z.string().min(1) });

export async function POST(request: Request, { params }: RouteParams) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Re-verify host role
  const { data: membership } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (membership?.role !== "host") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid storage key" }, { status: 422 });
  }

  // Security: key must start with eventId
  if (!parsed.data.storage_key.startsWith(eventId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get public URL (event-covers is a public bucket)
  const {
    data: { publicUrl },
  } = adminSupabase.storage
    .from("event-covers")
    .getPublicUrl(parsed.data.storage_key);

  const { data: event, error } = await adminSupabase
    .from("events")
    .update({ cover_image_url: publicUrl })
    .eq("id", eventId)
    .select("id, title, cover_image_url")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to save cover image" },
      { status: 500 }
    );
  }

  return NextResponse.json({ event, cover_image_url: publicUrl });
}

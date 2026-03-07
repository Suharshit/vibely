// ============================================================
// apps/web/app/api/events/[id]/cover/route.ts
// ============================================================
// POST /api/events/:id/cover
// Generates a signed upload URL for the event cover image.
// Only the event host can upload a cover.
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

const schema = z.object({
  content_type: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  file_size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024, "Cover must be under 10MB"),
});

export async function POST(request: Request, { params }: RouteParams) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only the host can set a cover image
  const { data: membership } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (membership?.role !== "host") {
    return NextResponse.json(
      { error: "Only the event host can upload a cover image." },
      { status: 403 }
    );
  }

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

  const ext = parsed.data.content_type.split("/")[1].replace("jpeg", "jpg");
  // Key: {eventId}/cover.{ext} — fixed filename overwrites old cover automatically
  const storageKey = `${eventId}/cover.${ext}`;

  const { data: signedData, error } = await adminSupabase.storage
    .from("event-covers")
    .createSignedUploadUrl(storageKey);

  if (error || !signedData) {
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      upload_url: signedData.signedUrl,
      storage_key: storageKey,
    },
    { status: 201 }
  );
}

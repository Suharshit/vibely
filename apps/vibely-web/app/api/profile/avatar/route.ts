// ============================================================
// apps/web/app/api/profile/avatar/route.ts
// ============================================================
// POST /api/profile/avatar
//
// Same signed URL pattern as photo uploads — client uploads
// directly to Supabase Storage, we just issue the URL.
// Avatar key format: {userId}/avatar.{ext}
// WHY a fixed filename ("avatar") instead of UUID?
// Users can only have one avatar at a time. Using a fixed path
// means uploading a new avatar naturally overwrites the old one
// in storage — no orphan cleanup needed.
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  content_type: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  file_size: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024, "Avatar must be under 5MB"),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  // Fixed path per user — overwrites previous avatar automatically
  const storageKey = `${user.id}/avatar.${ext}`;

  const { data: signedData, error } = await adminSupabase.storage
    .from("avatars")
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

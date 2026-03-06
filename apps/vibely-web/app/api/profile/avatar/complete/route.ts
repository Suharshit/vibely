// ============================================================
// apps/web/app/api/profile/avatar/complete/route.ts
// ============================================================
// POST /api/profile/avatar/complete
//
// After the client uploads the avatar file to Supabase Storage,
// it calls this endpoint with the storage_key. We build the
// public URL and save it to users.avatar_url.
//
// WHY a public URL instead of a signed URL for avatars?
// Avatars are in a public bucket. The public URL is permanent
// and can be embedded anywhere (img tags, og:image, etc.)
// without expiring. Signed URLs expire — bad for profile images.
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  storage_key: z.string().min(1),
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
    return NextResponse.json({ error: "Invalid storage key" }, { status: 422 });
  }

  // Security: verify the storage key belongs to this user
  // Key format: {userId}/avatar.{ext}
  const keyUserId = parsed.data.storage_key.split("/")[0];
  if (keyUserId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Build the public URL for the avatar
  // Supabase public bucket URL format:
  // https://{PROJECT_REF}.supabase.co/storage/v1/object/public/{bucket}/{key}
  const {
    data: { publicUrl },
  } = adminSupabase.storage
    .from("avatars")
    .getPublicUrl(parsed.data.storage_key);

  // Save to users table
  const { data: profile, error } = await adminSupabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id)
    .select("id, name, email, avatar_url, bio")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile, avatar_url: publicUrl });
}

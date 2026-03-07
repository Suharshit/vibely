// ============================================================
// apps/web/app/api/profile/route.ts
// ============================================================
// GET  /api/profile  — fetch current user's full profile
// PATCH /api/profile — update name, bio
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim().optional(),
  bio: z
    .string()
    .max(300, "Bio must be 300 characters or fewer")
    .trim()
    .optional(),
});

export async function GET() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await adminSupabase
    .from("users")
    .select("id, name, email, avatar_url, bio, created_at")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Fetch quick stats
  const [{ count: eventCount }, { count: photoCount }, { count: vaultCount }] =
    await Promise.all([
      adminSupabase
        .from("event_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      adminSupabase
        .from("photos")
        .select("*", { count: "exact", head: true })
        .eq("uploaded_by_user", user.id)
        .eq("status", "active"),
      adminSupabase
        .from("personal_vault")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  return NextResponse.json({
    profile,
    stats: {
      events: eventCount ?? 0,
      photos_uploaded: photoCount ?? 0,
      vault_size: vaultCount ?? 0,
    },
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const updates: Record<string, string> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data: profile, error } = await adminSupabase
    .from("users")
    .update(updates)
    .eq("id", user.id)
    .select("id, name, email, avatar_url, bio")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile });
}

// ============================================================
// apps/web/app/api/users/me/route.ts
// ============================================================
// WHY fetch from public.users and not just auth.getUser()?
// auth.getUser() returns the auth profile (email, provider, etc.)
// but NOT the extended profile fields we defined: name, bio,
// avatar_url. Those live in public.users.
//
// This route joins both: validates the session via getUser(),
// then fetches the full profile from public.users.
//
// WHY use the server client (not admin client) here?
// The user is authenticated — we WANT RLS to apply. Using the
// server client with the user's JWT means Postgres will only
// return the row if they're allowed to see it (they always can
// see their own row per our "public read" policy).
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // Step 1: validate the session — never trust client-sent user IDs
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Step 2: fetch the full profile from our public.users table
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, name, email, avatar_url, bio, auth_provider, created_at")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("[GET /api/users/me]", profileError);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ user: profile });
}

// ── PATCH /api/users/me ──────────────────────────────────────
// Update the current user's profile fields
export async function PATCH(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; bio?: string; avatar_url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Only allow updating specific fields — never let users change
  // id, email, auth_provider, or created_at via this endpoint
  const allowedUpdates: Record<string, string | undefined> = {};
  if (body.name !== undefined) allowedUpdates.name = body.name;
  if (body.bio !== undefined) allowedUpdates.bio = body.bio;
  if (body.avatar_url !== undefined)
    allowedUpdates.avatar_url = body.avatar_url;

  if (Object.keys(allowedUpdates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("users")
    .update(allowedUpdates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}

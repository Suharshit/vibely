// ============================================================
// apps/web/app/api/photos/[id]/download/route.ts
// ============================================================
// GET /api/photos/:id/download
//
// Returns a short-lived signed URL that forces the browser to
// download the file (Content-Disposition: attachment) rather
// than displaying it inline.
//
// WHY not just use the ImageKit URL for download?
// 1. ImageKit may serve a WebP-converted version — we want the
//    original file for download.
// 2. We need Content-Disposition: attachment. Supabase Storage
//    signed URLs let us set download=true which adds this header.
// 3. Access control: anyone with an ImageKit URL can download.
//    This endpoint enforces event membership before issuing the URL.
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch photo
  const { data: photo } = await adminSupabase
    .from("photos")
    .select("id, event_id, storage_key, original_filename, status")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  // Verify membership
  const { data: membership } = await supabase
    .from("event_members")
    .select("id")
    .eq("event_id", photo.event_id)
    .eq("user_id", user.id)
    .single();

  // Also allow vault owners (they saved it from an event they're no longer in)
  const { data: vaultEntry } = await supabase
    .from("personal_vault")
    .select("id")
    .eq("photo_id", id)
    .eq("user_id", user.id)
    .single();

  if (!membership && !vaultEntry) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Generate signed URL with download=true
  // TTL: 60 seconds — enough for the browser to initiate the download
  const { data, error } = await adminSupabase.storage
    .from("event-photos")
    .createSignedUrl(photo.storage_key, 60, {
      download: photo.original_filename, // sets Content-Disposition: attachment; filename="..."
    });

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500 }
    );
  }

  return NextResponse.json({ download_url: data.signedUrl });
}

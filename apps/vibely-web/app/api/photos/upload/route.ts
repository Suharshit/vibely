/* eslint-disable @typescript-eslint/no-unused-vars */
// ============================================================
// apps/web/app/api/photos/upload/route.ts
// ============================================================
// POST /api/photos/upload
//
// WHY a two-step upload flow?
// Option A (direct): Client uploads to your API → API uploads to Storage
//   ✗ File bytes travel through your server — slow, doubles bandwidth
//   ✗ 4MB Next.js body limit blocks large photos
//
// Option B (our approach): API generates a signed upload URL →
//   Client uploads directly to Supabase Storage
//   ✓ File bytes go client → Supabase directly (your server untouched)
//   ✓ No body size limits to worry about
//   ✓ Progress tracking works natively in the browser
//   ✓ API still controls auth — only valid sessions get URLs
//
// FLOW:
//  1. Client sends metadata (filename, size, type) to this route
//  2. We validate auth + membership + file type/size
//  3. We generate a Supabase Storage signed upload URL (60s TTL)
//  4. We INSERT the photo row into public.photos with status='uploading'
//  5. Client uploads directly to the signed URL
//  6. Client calls POST /api/photos/[id]/complete to flip status→'active'
//
// WHY save the DB row before the file is uploaded?
// If we saved after, and the upload failed, we'd have no record.
// Saving first lets us track in-progress uploads and clean up
// abandoned ones (e.g. user closed tab mid-upload) in the cron job.
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { uploadInitSchema } from "@shared/validation/photo.schemas";
import { buildStorageKey, sanitizeFilename } from "@shared/utils/storage";
import { uploadRateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: Request) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // ── Step 1: Parse and validate the request body ─────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = uploadInitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { event_id, filename, content_type, file_size, guest_token } =
    parsed.data;

  // Rate limiting to prevent abuse
  const rateLimitId = guest_token
    ? `guest:${guest_token}`
    : ((await supabase.auth.getUser()).data.user?.id ?? "unknown");
  const rateLimitResult = await uploadRateLimit(request, rateLimitId);
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  // ── Step 2: Resolve the uploader identity ───────────────────
  // Either an authenticated user OR a guest with a valid session token.
  let uploadedByUser: string | null = null;
  let uploadedByGuest: string | null = null;

  if (guest_token) {
    // Guest upload path: validate the session token
    const { data: guestSession } = await adminSupabase
      .from("guest_sessions")
      .select("id, event_id")
      .eq("session_token", guest_token)
      .eq("event_id", event_id) // token must match this event
      .single();

    if (!guestSession) {
      return NextResponse.json(
        { error: "Invalid or expired guest session" },
        { status: 401 }
      );
    }
    uploadedByGuest = guestSession.id;
  } else {
    // Authenticated user path
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    uploadedByUser = user.id;
  }

  // ── Step 3: Verify upload permission for this event ─────────
  const { data: event } = await adminSupabase
    .from("events")
    .select("id, status, upload_permission")
    .eq("id", event_id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (event.status !== "active") {
    return NextResponse.json(
      { error: "This event has ended. Uploads are no longer accepted." },
      { status: 410 }
    );
  }

  // If upload_permission is 'restricted', only registered members can upload.
  // Guests are blocked.
  if (event.upload_permission === "restricted" && !uploadedByUser) {
    return NextResponse.json(
      { error: "This event requires an account to upload photos." },
      { status: 403 }
    );
  }

  // If authenticated user, verify they're actually a member of this event
  if (uploadedByUser) {
    const { data: membership } = await supabase
      .from("event_members")
      .select("id")
      .eq("event_id", event_id)
      .eq("user_id", uploadedByUser)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "You must join this event before uploading photos." },
        { status: 403 }
      );
    }
  }

  // ── Step 4: Generate photo ID and storage key ────────────────
  // crypto.randomUUID() produces a proper RFC-4122 UUID required by
  // the photos.id UUID column. It has the same entropy as nanoid-21.
  const photoId = crypto.randomUUID();
  const storageKey = buildStorageKey(event_id, photoId, filename);

  // ── Step 5: Create a signed upload URL ──────────────────────
  // The signed URL allows a PUT request directly from the browser
  // to Supabase Storage without exposing credentials.
  // TTL: 60 seconds — enough for the client to start uploading.
  const { data: signedData, error: signedError } = await adminSupabase.storage
    .from("event-photos")
    .createSignedUploadUrl(storageKey);

  if (signedError || !signedData) {
    console.error("[POST /api/photos/upload] Signed URL error:", signedError);
    return NextResponse.json(
      { error: "Failed to generate upload URL. Please try again." },
      { status: 500 }
    );
  }

  // ── Step 6: Save photo metadata row with status='uploading' ──
  // We use the thumbnail_key as the same path — ImageKit will serve
  // a transformed version from the same storage_key.
  const { error: insertError } = await adminSupabase.from("photos").insert({
    id: photoId,
    event_id,
    uploaded_by_user: uploadedByUser,
    uploaded_by_guest: uploadedByGuest,
    storage_key: storageKey,
    thumbnail_key: storageKey, // ImageKit transforms handle sizing
    original_filename: sanitizeFilename(filename),
    file_size,
    status: "uploading", // flipped to 'active' after upload completes
    is_saved_to_vault: false,
  });

  if (insertError) {
    console.error("[POST /api/photos/upload] Insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to create photo record" },
      { status: 500 }
    );
  }

  // Return the signed URL and photo ID to the client
  return NextResponse.json(
    {
      photo_id: photoId,
      storage_key: storageKey,
      upload_url: signedData.signedUrl,
      token: signedData.token,
    },
    { status: 201 }
  );
}

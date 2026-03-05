// ============================================================
// apps/web/app/api/events/[id]/gallery/route.ts
// ============================================================
// GET /api/events/:id/gallery?page=1&limit=20
//
// Returns paginated photos for an event with ImageKit URLs
// pre-built for thumbnail and preview sizes.
//
// WHY pagination?
// An event could have 500+ photos. Loading all metadata at once
// is slow and expensive. Cursor-based or offset pagination keeps
// initial load fast. We use offset (page/limit) here because the
// gallery has a fixed grid layout — users jump to page N directly.
//
// WHY return ImageKit URLs from the API?
// The transformation parameters are business logic that shouldn't
// live in the client. The API decides "thumbnails are 400×400 WebP"
// — the client just renders whatever URL it receives.
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { thumbnailUrl, previewUrl } from "@shared/utils/storage";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { id: eventId } = await params;
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20"))
  );
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify membership
  const { data: membership } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Fetch photos with uploader info and vault status
  const {
    data: photos,
    error,
    count,
  } = await adminSupabase
    .from("photos")
    .select(
      `
      id,
      event_id,
      storage_key,
      original_filename,
      file_size,
      is_saved_to_vault,
      created_at,
      uploaded_by_user,
      uploaded_by_guest,
      uploader:users!uploaded_by_user ( id, name, avatar_url )
    `,
      { count: "exact" }
    )
    .eq("event_id", eventId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[GET /api/events/:id/gallery]", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }

  // Build per-photo signed URLs as a fallback when ImageKit cannot fetch
  // from a private bucket. This keeps previews working in all envs.
  const signedByPath = new Map<string, string>();
  const storageKeys = (photos ?? []).map((p) => p.storage_key);
  if (storageKeys.length > 0) {
    const { data: signedData, error: signedError } = await adminSupabase.storage
      .from("event-photos")
      .createSignedUrls(storageKeys, 60 * 60);

    if (signedError) {
      console.error(
        "[GET /api/events/:id/gallery] signed URL error",
        signedError
      );
    } else {
      for (const item of signedData ?? []) {
        if (!item.path || !item.signedUrl) continue;
        const normalized = item.signedUrl.startsWith("http")
          ? item.signedUrl
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${item.signedUrl}`;
        signedByPath.set(item.path, normalized);
      }
    }
  }

  // Also check which photos the current user has saved
  const photoIds = (photos ?? []).map((p) => p.id);

  // Guard: .in() with an empty array is a no-op but can behave
  // unexpectedly in some client versions — skip the query entirely.
  const savedPhotoIds = new Set<string>();
  if (photoIds.length > 0) {
    const { data: vaultEntries } = await adminSupabase
      .from("personal_vault")
      .select("photo_id")
      .eq("user_id", user.id)
      .in("photo_id", photoIds);
    (vaultEntries ?? []).forEach((v) => savedPhotoIds.add(v.photo_id));
  }

  // Augment photos with ImageKit URLs and vault status for current user
  const augmented = (photos ?? []).map((photo) => ({
    ...photo,
    thumbnail_url: thumbnailUrl(photo.storage_key),
    preview_url: previewUrl(photo.storage_key),
    fallback_url: signedByPath.get(photo.storage_key) ?? null,
    saved_by_me: savedPhotoIds.has(photo.id),
    is_mine: photo.uploaded_by_user === user.id,
  }));

  const totalPages = Math.ceil((count ?? 0) / limit);

  return NextResponse.json({
    photos: augmented,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  });
}

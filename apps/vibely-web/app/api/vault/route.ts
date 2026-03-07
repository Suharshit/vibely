/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================
// apps/web/app/api/vault/route.ts
// ============================================================
// GET /api/vault
//
// Returns all photos the authenticated user has saved to their
// personal vault, grouped by event, with ImageKit URLs.
//
// WHY group by event?
// Vault photos come from multiple events. Rendering them in a
// flat grid loses context ("where is this photo from?").
// Grouping by event makes the vault browsable and meaningful.
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { thumbnailUrl, previewUrl } from "@shared/utils/storage";

export async function GET() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch vault entries with full photo + event info
  const { data: vaultEntries, error } = await adminSupabase
    .from("personal_vault")
    .select(
      `
      id,
      saved_at,
      photo:photos (
        id,
        storage_key,
        original_filename,
        file_size,
        created_at,
        uploaded_by_user,
        uploaded_by_guest,
        status,
        event:events (
          id,
          title,
          event_date
        ),
        uploader:users!uploaded_by_user (
          id, name, avatar_url
        )
      )
    `
    )
    .eq("user_id", user.id)
    .eq("photo.status", "active") // exclude deleted photos
    .order("saved_at", { ascending: false });

  if (error) {
    console.error("[GET /api/vault]", error);
    return NextResponse.json(
      { error: "Failed to fetch vault" },
      { status: 500 }
    );
  }

  // Filter out entries where the photo was deleted (status filter above
  // may not work perfectly on joined tables in all Supabase versions)
  const validEntries = (vaultEntries ?? []).filter((e) => e.photo !== null);

  // Build signed URLs as a fallback for environments where ImageKit cannot
  // fetch directly from a private bucket.
  const signedByPath = new Map<string, string>();
  const storageKeys = validEntries
    .map(
      (entry) => (entry.photo as { storage_key?: string } | null)?.storage_key
    )
    .filter((key): key is string => !!key);

  if (storageKeys.length > 0) {
    const { data: signedData, error: signedError } = await adminSupabase.storage
      .from("event-photos")
      .createSignedUrls(storageKeys, 60 * 60);

    if (signedError) {
      console.error("[GET /api/vault] signed URL error", signedError);
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

  // Augment with ImageKit URLs
  const augmented = validEntries.map((entry) => {
    const photo = entry.photo as any;
    return {
      vault_entry_id: entry.id,
      saved_at: entry.saved_at,
      photo: {
        ...photo,
        thumbnail_url: thumbnailUrl(photo.storage_key),
        preview_url: previewUrl(photo.storage_key),
        fallback_url: signedByPath.get(photo.storage_key) ?? null,
      },
    };
  });

  // Group by event for the UI
  const byEvent: Record<
    string,
    {
      event: { id: string; title: string; event_date: string };
      photos: typeof augmented;
    }
  > = {};

  for (const entry of augmented) {
    const photo = entry.photo as any;
    const event = photo.event;
    if (!event) continue;
    if (!byEvent[event.id]) {
      byEvent[event.id] = { event, photos: [] };
    }
    byEvent[event.id].photos.push(entry);
  }

  return NextResponse.json({
    total: augmented.length,
    groups: Object.values(byEvent),
    // Also return flat list for simple grid view
    photos: augmented,
  });
}

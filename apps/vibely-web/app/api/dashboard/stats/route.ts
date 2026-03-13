// ============================================================
// apps/vibely-web/app/api/dashboard/stats/route.ts
// ============================================================
// GET /api/dashboard/stats
// Aggregates total photos across all events the user is a member of,
// and total bytes for photos saved in their personal vault.
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Get total photos in all events the user is part of
  const { data: userEvents, error: eventsError } = await supabase
    .from("event_members")
    .select("event_id")
    .eq("user_id", user.id);

  if (eventsError) {
    return NextResponse.json(
      { error: "Failed to fetch user events" },
      { status: 500 }
    );
  }

  const eventIds = userEvents.map((em) => em.event_id);
  let totalPhotos = 0;

  if (eventIds.length > 0) {
    const { count: photosCount, error: photosError } = await supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .in("event_id", eventIds)
      .eq("status", "active");

    if (photosError) {
      return NextResponse.json(
        { error: "Failed to fetch photo count" },
        { status: 500 }
      );
    }
    totalPhotos = photosCount ?? 0;
  }

  // 2. Get total size of all items in personal vault
  const { data: vaultItems, error: vaultError } = await supabase
    .from("personal_vault")
    .select("photo:photos(file_size)")
    .eq("user_id", user.id);

  let totalBytes = 0;
  if (vaultError) {
    return NextResponse.json(
      { error: "Failed to fetch vault items" },
      { status: 500 }
    );
  }
  totalBytes = vaultItems.reduce(
    (acc, item) => acc + (item.photo?.file_size ?? 0),
    0
  );

  return NextResponse.json({
    totalPhotos,
    totalBytes,
  });
}

// ============================================================
// apps/vibely-web/lib/notify.ts
// ============================================================
// Utility function to create a new notification using the
// admin Supabase client. This is used by other API routes
// when actions occur (like photo uploads) to alert users.
// ============================================================

import { createAdminClient } from "@/lib/supabase/server";

export async function createNotification(
  userId: string,
  type: "photo_uploaded" | "member_joined" | "event_expiring",
  message: string,
  eventId?: string,
  photoId?: string
) {
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      message,
      event_id: eventId || null,
      photo_id: photoId || null,
    });

  if (error) {
    console.error("Failed to create notification:", error);
  }
}

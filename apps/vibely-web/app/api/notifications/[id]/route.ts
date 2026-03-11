// ============================================================
// apps/vibely-web/app/api/notifications/[id]/route.ts
// ============================================================
// PATCH /api/notifications/[id]
// Marks a specific notification as read.
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mark single notification as read, ensuring it belongs to the user
  const { error: updateError } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

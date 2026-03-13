// ============================================================
// apps/vibely-web/app/api/notifications/route.ts
// ============================================================
// GET /api/notifications
// Retrieves paginated unread notifications for the current user.
//
// PATCH /api/notifications
// Marks all or specific notifications as read.
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unknown, z } from "zod";

const markReadSchema = z
  .object({
    all: z.boolean().optional(),
    ids: z.array(z.string().uuid()).optional(),
  })
  .refine((data) => data.all || (data.ids && data.ids.length > 0), {
    message: "Must provide either 'all: true' or a non-empty array of 'ids'",
  });

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch paginated unread notifications for the current user
  const { data: notifications, error: fetchError } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (fetchError) {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }

  // Get unread count
  const { count, error: countError } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (countError) {
    return NextResponse.json(
      { error: "Failed to fetch notification count" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    notifications: notifications || [],
    unread_count: count || 0,
  });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body = unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = markReadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { all, ids } = result.data;

    let updateQuery = supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);

    if (!all && ids) {
      updateQuery = updateQuery.in("id", ids);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

// ============================================================
// apps/web/app/api/photos/[id]/save/route.ts
// ============================================================
// POST   /api/photos/:id/save   — save photo to personal vault
// DELETE /api/photos/:id/save   — remove photo from personal vault
//
// WHY a separate /save endpoint instead of PATCH on the photo?
// Saving is a relationship between a USER and a PHOTO (personal_vault
// junction table), not a property of the photo itself. Multiple users
// can save the same photo independently. A PATCH on the photo row
// can't model per-user saves — a dedicated resource is correct REST.
// ============================================================

import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

type RouteParams = { params: Promise<{ id: string }> };

// ── POST — save to vault ─────────────────────────────────────

export async function POST(_req: Request, { params }: RouteParams) {
  const { id: photoId } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify photo exists and is active
  const { data: photo } = await adminSupabase
    .from('photos')
    .select('id, event_id, status')
    .eq('id', photoId)
    .eq('status', 'active')
    .single();

  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  // Verify user is a member of the event this photo belongs to
  const { data: membership } = await supabase
    .from('event_members')
    .select('id')
    .eq('event_id', photo.event_id)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // INSERT ... ON CONFLICT DO NOTHING (idempotent save).
  // We use insert() rather than upsert() because personal_vault has no
  // UPDATE RLS policy — upsert()'s DO UPDATE path would be denied.
  // Instead we insert and treat the unique-violation (23505) as success.
  const { error } = await supabase
    .from('personal_vault')
    .insert({ user_id: user.id, photo_id: photoId });

  // 23505 = unique_violation: photo already saved to vault — that's fine
  if (error && error.code !== '23505') {
    return NextResponse.json({ error: 'Failed to save photo' }, { status: 500 });
  }

  // The sync_vault_flag() DB trigger automatically sets
  // photos.is_saved_to_vault = true for this photo

  return NextResponse.json({ success: true, saved: true });
}

// ── DELETE — remove from vault ───────────────────────────────

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id: photoId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('personal_vault')
    .delete()
    .eq('user_id', user.id)
    .eq('photo_id', photoId);

  if (error) {
    return NextResponse.json({ error: 'Failed to unsave photo' }, { status: 500 });
  }

  // The sync_vault_flag() DB trigger automatically updates
  // photos.is_saved_to_vault based on remaining vault entries

  return NextResponse.json({ success: true, saved: false });
}
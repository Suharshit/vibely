// ============================================================
// apps/web/app/api/photos/[id]/route.ts
// ============================================================
// GET    /api/photos/:id  — fetch single photo with signed URL
// DELETE /api/photos/:id  — soft-delete (status → 'deleted')
// ============================================================

import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { thumbnailUrl, previewUrl } from '@shared/utils/storage';

type RouteParams = { params: Promise<{ id: string }> };

// ── GET ──────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: photo, error } = await adminSupabase
    .from('photos')
    .select(`
      id, event_id, storage_key, thumbnail_key,
      original_filename, file_size, status,
      is_saved_to_vault, created_at,
      uploader:users!uploaded_by_user ( id, name, avatar_url )
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error || !photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  // Verify requester is a member of the event this photo belongs to
  const { data: membership } = await supabase
    .from('event_members')
    .select('id')
    .eq('event_id', photo.event_id)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Check whether this specific user has saved the photo to their vault
  const { data: vaultEntry } = await supabase
    .from('personal_vault')
    .select('id')
    .eq('user_id', user.id)
    .eq('photo_id', photo.id)
    .maybeSingle();

  const { data: signedData } = await adminSupabase
    .storage
    .from('event-photos')
    .createSignedUrl(photo.storage_key, 60 * 60);

  const fallbackUrl = signedData?.signedUrl
    ? (signedData.signedUrl.startsWith('http')
      ? signedData.signedUrl
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${signedData.signedUrl}`)
    : null;

  return NextResponse.json({
    photo: {
      ...photo,
      thumbnail_url: thumbnailUrl(photo.storage_key),
      preview_url: previewUrl(photo.storage_key),
      fallback_url: fallbackUrl,
      saved_by_me: !!vaultEntry,
    },
  });
}

// ── DELETE ───────────────────────────────────────────────────
// We soft-delete by setting status='deleted' rather than removing
// the DB row. WHY?
// 1. If a user saved this photo to their vault, deleting the DB row
//    would break their vault reference.
// 2. Hard deletion from storage is handled by the Phase 12 cron job,
//    not individual API calls (batching is more efficient).
// 3. Audit trail: we can see what was deleted and when.

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: photo } = await adminSupabase
    .from('photos')
    .select('id, event_id, uploaded_by_user, status')
    .eq('id', id)
    .single();

  if (!photo || photo.status === 'deleted') {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  // Check: uploader or event host can delete
  const isUploader = photo.uploaded_by_user === user.id;
  const { data: hostMembership } = await supabase
    .from('event_members')
    .select('role')
    .eq('event_id', photo.event_id)
    .eq('user_id', user.id)
    .single();

  const isHost = hostMembership?.role === 'host';

  if (!isUploader && !isHost) {
    return NextResponse.json({ error: 'You cannot delete this photo' }, { status: 403 });
  }

  const { error: updateError } = await adminSupabase
    .from('photos')
    .update({
      status: 'deleted',
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
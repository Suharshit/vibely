// ============================================================
// apps/web/app/api/photos/[id]/complete/route.ts
// ============================================================
// POST /api/photos/:id/complete
//
// Called by the client AFTER the file has been uploaded to
// Supabase Storage using the signed URL. This flips the photo
// status from 'uploading' → 'active' so it appears in galleries.
//
// WHY verify the file exists in storage before activating?
// Without this check, a malicious client could call /complete
// without actually uploading anything — creating ghost photo
// records. We verify the object exists in storage first.
// ============================================================

import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { thumbnailUrl, previewUrl } from '@shared/utils/storage';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  const { id: photoId } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Fetch the photo record — must exist and be in 'uploading' state
  const { data: photo, error: fetchError } = await adminSupabase
    .from('photos')
    .select('id, event_id, storage_key, uploaded_by_user, uploaded_by_guest, status')
    .eq('id', photoId)
    .single();

  if (fetchError || !photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  if (photo.status !== 'uploading') {
    // Already activated or deleted — idempotent response
    return NextResponse.json({ success: true, status: photo.status });
  }

  // Verify the caller owns this upload
  if (photo.uploaded_by_user) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== photo.uploaded_by_user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  // Guest verification is less strict — they have no persistent auth
  // The guest_token was validated during /upload, so we trust the photoId

  // Verify the file actually exists in storage.
  // Derive the folder path from the stored storage_key so we always
  // list the exact same prefix used during upload — avoids any
  // mismatch if the path structure ever changes.
  const storageFolder = photo.storage_key.split('/').slice(0, -1).join('/');
  const { data: fileList, error: listError } = await adminSupabase
    .storage
    .from('event-photos')
    .list(storageFolder);

  if (listError || !fileList || fileList.length === 0) {
    // File not found in storage — clean up the orphan DB row
    await adminSupabase.from('photos').delete().eq('id', photoId);
    return NextResponse.json(
      { error: 'File not found in storage. Please try uploading again.' },
      { status: 422 }
    );
  }

  // Flip status to 'active' — photo now appears in galleries
  const { data: updated, error: updateError } = await adminSupabase
    .from('photos')
    .update({ status: 'active' })
    .eq('id', photoId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: 'Failed to activate photo' }, { status: 500 });
  }

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
    success: true,
    photo: {
      ...updated,
      thumbnail_url: thumbnailUrl(photo.storage_key),
      preview_url: previewUrl(photo.storage_key),
      fallback_url: fallbackUrl,
      saved_by_me: false,
      is_mine: true,
    },
  });
}
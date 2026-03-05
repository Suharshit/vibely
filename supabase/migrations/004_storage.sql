-- ============================================================
-- Vibely: Storage Bucket + RLS Policies
-- Migration: 004_storage.sql
-- ============================================================
-- WHY Supabase Storage instead of R2?
-- Supabase Storage lives inside the same project as your DB and
-- Auth. This means:
--   1. RLS policies on storage.objects can JOIN public.event_members
--      so the same membership rules that guard your DB rows also
--      guard your files — one security model, not two.
--   2. No extra credentials to manage — same anon/service keys.
--   3. Signed URLs are generated server-side with the same client
--      you're already using everywhere.
--
-- HOW Supabase Storage works:
-- Files live in "buckets". Each file's metadata is stored in the
-- storage.objects Postgres table, so you can write RLS policies
-- on it just like any other table.
-- The actual bytes are stored in an S3-compatible backend.
-- ============================================================


-- ============================================================
-- BUCKET: event-photos
-- ============================================================
-- We use the service role to create the bucket (dashboard UI
-- does the same thing). Private = all access requires RLS.
-- file_size_limit: 10MB in bytes
-- allowed_mime_types: only image formats we support
-- ============================================================
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'event-photos',
  'event-photos',
  false,                    -- private: signed URLs required for read
  10485760,                 -- 10 MB = 10 * 1024 * 1024 bytes
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
ON CONFLICT (id) DO NOTHING;  -- idempotent — safe to re-run


-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================
-- storage.objects has these columns we use in policies:
--   bucket_id  TEXT    — which bucket ('event-photos')
--   name       TEXT    — the full object path (storage key)
--   owner      UUID    — auth.uid() of uploader
--
-- Our storage key format: events/{eventId}/{photoId}/{filename}
-- We extract the eventId using split_part(name, '/', 2)
-- ============================================================


-- ── SELECT (read/download) ───────────────────────────────────
-- Event members can read photos in their events.
-- We also allow service role for signed URL generation.
CREATE POLICY "storage: event members can read photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'event-photos'
    AND (
      -- Service role bypasses (for signed URL generation in API)
      auth.role() = 'service_role'
      -- Authenticated members of the event
      OR EXISTS (
        SELECT 1 FROM public.event_members em
        WHERE em.event_id::text = split_part(name, '/', 2)
          AND em.user_id = auth.uid()
      )
    )
  );


-- ── INSERT (upload) ──────────────────────────────────────────
-- Authenticated users can upload to events they're members of.
-- Guest uploads go through service role (API handles auth).
CREATE POLICY "storage: event members can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-photos'
    AND (
      auth.role() = 'service_role'
      OR (
        auth.uid() IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.event_members em
          WHERE em.event_id::text = split_part(name, '/', 2)
            AND em.user_id = auth.uid()
        )
      )
    )
  );


-- ── UPDATE ───────────────────────────────────────────────────
-- Needed for upsert operations (e.g. replacing a photo).
-- Only the original uploader or service role.
CREATE POLICY "storage: uploader can update their photo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'event-photos'
    AND (
      auth.role() = 'service_role'
      OR auth.uid() = owner
    )
  );


-- ── DELETE ───────────────────────────────────────────────────
-- Photo owner OR event host can delete.
-- Service role handles cron cleanup in Phase 12.
CREATE POLICY "storage: owner or host can delete photo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'event-photos'
    AND (
      auth.role() = 'service_role'
      OR auth.uid() = owner
      OR EXISTS (
        SELECT 1 FROM public.event_members em
        WHERE em.event_id::text = split_part(name, '/', 2)
          AND em.user_id = auth.uid()
          AND em.role = 'host'
      )
    )
  );
-- ============================================================
-- Migration 005: Add 'uploading' to photos.status CHECK constraint
-- ============================================================
-- PROBLEM:
-- The initial schema defined photos.status as:
--   CHECK (status IN ('active', 'deleted', 'archived'))
-- but the two-step upload flow requires an intermediate
-- 'uploading' status:
--   1. POST /api/photos/upload → INSERT with status='uploading'
--   2. Client uploads file directly to Supabase Storage
--   3. POST /api/photos/[id]/complete → UPDATE status='active'
--
-- Without 'uploading' in the constraint, every upload INSERT
-- fails with a constraint violation before the file is sent.
-- ============================================================

ALTER TABLE public.photos
  DROP CONSTRAINT IF EXISTS photos_status_check;

ALTER TABLE public.photos
  ADD CONSTRAINT photos_status_check
    CHECK (status IN ('active', 'uploading', 'deleted', 'archived'));

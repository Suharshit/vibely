-- ============================================================
-- Vibely: Phase 11 Migration
-- Migration: 005_cleanup_jobs.sql
-- ============================================================
-- Sets up automated cleanup via pg_cron (built into Supabase).
--
-- WHY pg_cron instead of an external cron service?
-- pg_cron runs inside Postgres — it has direct access to your
-- tables without needing network calls or API keys. It's free,
-- already available in every Supabase project, and survives
-- cold starts. External services (GitHub Actions, Vercel cron)
-- add complexity and can silently fail.
--
-- HOW pg_cron works:
-- You insert a row into cron.job specifying a schedule (standard
-- cron syntax) and a SQL command to run. Supabase runs it on the
-- schedule automatically.
--
-- Supabase pg_cron docs:
-- https://supabase.com/docs/guides/database/extensions/pg_cron
-- ============================================================

-- Enable the pg_cron extension (may already be enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;


-- ============================================================
-- JOB 1: Mark expired events
-- Schedule: every day at 00:05 UTC
-- ============================================================
-- WHY 00:05 and not midnight exactly?
-- Slight offset avoids thundering herd if multiple Supabase
-- projects run jobs at exactly midnight simultaneously.
--
-- What it does:
-- Finds events where expires_at has passed and status is still
-- 'active', then flips them to 'expired'. This is purely a
-- status flag — it doesn't delete anything. Photos remain in
-- storage until the cleanup Edge Function runs.
-- ============================================================

SELECT cron.schedule(
  'expire-events',           -- job name (unique)
  '5 0 * * *',               -- 00:05 UTC daily
  $$
    UPDATE public.events
    SET status = 'expired'
    WHERE status = 'active'
      AND expires_at < now();
  $$
);


-- ============================================================
-- JOB 2: Soft-delete photos from expired events
-- Schedule: every day at 00:15 UTC
-- ============================================================
-- After events expire, their photos should be soft-deleted
-- UNLESS the photo has been saved to someone's vault.
-- is_saved_to_vault = true means at least one user saved it —
-- those photos stay until the user removes them from their vault.
-- ============================================================

SELECT cron.schedule(
  'soft-delete-expired-photos',
  '15 0 * * *',
  $$
    UPDATE public.photos p
    SET
      status = 'deleted',
      deleted_at = now()
    FROM public.events e
    WHERE p.event_id = e.id
      AND e.status = 'expired'
      AND p.status = 'active'
      AND p.is_saved_to_vault = false;
  $$
);


-- ============================================================
-- JOB 3: Clean up abandoned uploads
-- Schedule: every hour at :30
-- ============================================================
-- When a user closes the tab mid-upload, the photo row stays
-- with status='uploading' forever. We clean these up after 2
-- hours — more than enough time for any legitimate upload to
-- complete (even on very slow connections).
--
-- WHY 2 hours and not 1?
-- The signed upload URL TTL is 60 seconds — so anything still
-- 'uploading' after 2 hours is definitely abandoned, not slow.
-- ============================================================

SELECT cron.schedule(
  'cleanup-abandoned-uploads',
  '30 * * * *',
  $$
    DELETE FROM public.photos
    WHERE status = 'uploading'
      AND created_at < now() - interval '2 hours';
  $$
);


-- ============================================================
-- JOB 4: Clean up old guest sessions
-- Schedule: every day at 01:00 UTC
-- ============================================================
-- Guest sessions older than 90 days are no longer useful.
-- The event they belonged to has long since expired.
-- ============================================================

SELECT cron.schedule(
  'cleanup-old-guest-sessions',
  '0 1 * * *',
  $$
    DELETE FROM public.guest_sessions
    WHERE created_at < now() - interval '90 days';
  $$
);


-- ============================================================
-- Verify jobs were created
-- Run this query to see all scheduled jobs:
-- SELECT * FROM cron.job;
-- ============================================================


-- ============================================================
-- HELPER FUNCTION: sync_vault_flag
-- ============================================================
-- Called by a trigger to keep photos.is_saved_to_vault in sync
-- with the personal_vault table.
-- WHY denormalize this flag?
-- The cleanup job uses is_saved_to_vault to decide which photos
-- to preserve. If we had to JOIN personal_vault in the cron
-- query, it would be slower and more complex. Denormalizing into
-- a boolean on the photos row makes the cron query a simple
-- single-table UPDATE.
-- ============================================================

CREATE OR REPLACE FUNCTION sync_vault_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.photos SET is_saved_to_vault = true WHERE id = NEW.photo_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Only set to false if no other user has this in their vault
    UPDATE public.photos
    SET is_saved_to_vault = EXISTS (
      SELECT 1 FROM public.personal_vault WHERE photo_id = OLD.photo_id
    )
    WHERE id = OLD.photo_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_vault_change
  AFTER INSERT OR DELETE ON public.personal_vault
  FOR EACH ROW EXECUTE FUNCTION sync_vault_flag();
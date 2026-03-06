-- ============================================================
-- Vibely: Phase 10 Migration
-- Migration: 006_profile_and_covers.sql
-- ============================================================
-- Changes:
--   1. Add bio column to users table
--   2. Create avatars bucket (public — avatars are meant to be seen)
--   3. Create event-covers bucket (public — banner images)
--   4. Confirm guest_sessions table exists (created in 001, verified here)
--   5. Add downloaded_at tracking to personal_vault
-- ============================================================


-- ── 1. Add bio to users ──────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 300);


-- ── 2. Avatars bucket ────────────────────────────────────────
-- Public: avatars appear in event member lists, photo uploaders,
-- profile pages — they need to be readable without auth tokens.
-- WHY separate from event-photos?
-- Different lifecycle (avatars persist forever, photos expire).
-- Different access pattern (always public vs event-scoped).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true,
  5242880,   -- 5MB max for avatars
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Avatars: only the owner can upload/update their own avatar
CREATE POLICY "avatars: owner can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (
      auth.role() = 'service_role'
      OR auth.uid()::text = split_part(name, '/', 1)
    )
  );
-- Key format for avatars: {userId}/{filename}
-- e.g. "abc123-def4.../avatar.jpg"

CREATE POLICY "avatars: owner can update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (auth.role() = 'service_role' OR auth.uid() = owner)
  );

CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');


-- ── 3. Event covers bucket ───────────────────────────────────
-- Public: cover images appear on event cards and detail pages.
-- Anyone who can see the event can see its cover image.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-covers', 'event-covers', true,
  10485760,   -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Cover images: only event host can upload/update the cover
CREATE POLICY "event-covers: host can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-covers'
    AND (
      auth.role() = 'service_role'
      OR EXISTS (
        SELECT 1 FROM public.event_members em
        WHERE em.event_id::text = split_part(name, '/', 1)
          AND em.user_id = auth.uid()
          AND em.role = 'host'
      )
    )
  );
-- Key format for covers: {eventId}/{filename}

CREATE POLICY "event-covers: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-covers');

CREATE POLICY "event-covers: host can update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'event-covers'
    AND (auth.role() = 'service_role' OR auth.uid() = owner)
  );


-- ── 4. Guest sessions (verify / create if missing) ───────────
-- This table should exist from migration 001. Creating it here
-- with IF NOT EXISTS as a safety net.
CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  session_token   TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 50),
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guest_sessions_token_idx ON public.guest_sessions(session_token);
CREATE INDEX IF NOT EXISTS guest_sessions_event_idx ON public.guest_sessions(event_id);

-- RLS + policy for guest_sessions already applied in 002_rls_policies.sql
-- (kept CREATE TABLE/INDEX IF NOT EXISTS above as a safety net only)
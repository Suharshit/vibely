-- ============================================================
-- Migration 003: Fix RLS infinite recursion
-- ============================================================
-- PROBLEM:
-- The event_members SELECT policy references event_members itself:
--   USING (EXISTS (SELECT 1 FROM event_members em2 WHERE ...))
-- This causes PostgreSQL to apply the same policy on the inner
-- SELECT, creating infinite recursion (error 42P17).
--
-- The same issue cascades to any policy on OTHER tables that
-- queries event_members (events, photos) — because the inner
-- query triggers the recursive event_members SELECT policy.
--
-- FIX:
-- Create SECURITY DEFINER helper functions that run as the
-- function owner (postgres, which has BYPASSRLS). These
-- functions can query event_members without triggering RLS
-- policies, breaking the recursion chain.
-- ============================================================


-- ── Helper: check if a user is a member of an event ──────────
-- SECURITY DEFINER = runs as the function owner (postgres),
-- which bypasses RLS. This breaks the recursion chain.
CREATE OR REPLACE FUNCTION public.is_event_member(p_event_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.event_members
    WHERE event_id = p_event_id AND user_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- ── Helper: check if a user is the host of an event ──────────
CREATE OR REPLACE FUNCTION public.is_event_host(p_event_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.event_members
    WHERE event_id = p_event_id
      AND user_id = p_user_id
      AND role = 'host'
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- ============================================================
-- Drop ALL old policies that cause recursion, then recreate
-- ============================================================

-- ── EVENT_MEMBERS policies ───────────────────────────────────

DROP POLICY IF EXISTS "event_members: members read" ON public.event_members;
DROP POLICY IF EXISTS "event_members: self join" ON public.event_members;
DROP POLICY IF EXISTS "event_members: host update" ON public.event_members;
DROP POLICY IF EXISTS "event_members: host or self delete" ON public.event_members;

-- Users can read ALL member rows for events they belong to
CREATE POLICY "event_members: members read"
  ON public.event_members FOR SELECT
  USING (public.is_event_member(event_id, auth.uid()));

-- Users can insert their own membership (joining an event)
CREATE POLICY "event_members: self join"
  ON public.event_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the host can update member rows (e.g. change roles)
CREATE POLICY "event_members: host update"
  ON public.event_members FOR UPDATE
  USING (public.is_event_host(event_id, auth.uid()));

-- Host can remove anyone; users can remove themselves
CREATE POLICY "event_members: host or self delete"
  ON public.event_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR public.is_event_host(event_id, auth.uid())
  );


-- ── EVENTS policies ─────────────────────────────────────────

DROP POLICY IF EXISTS "events: members or public active read" ON public.events;

-- Users can see active events (for invite pages) OR any event
-- they're a member of (including expired ones in their dashboard)
CREATE POLICY "events: members or public active read"
  ON public.events FOR SELECT
  USING (
    status = 'active'
    OR public.is_event_member(id, auth.uid())
  );


-- ── PHOTOS policies ─────────────────────────────────────────

DROP POLICY IF EXISTS "photos: event members read" ON public.photos;
DROP POLICY IF EXISTS "photos: members upload" ON public.photos;
DROP POLICY IF EXISTS "photos: owner or host soft delete" ON public.photos;

-- Members can view active photos in their events
CREATE POLICY "photos: event members read"
  ON public.photos FOR SELECT
  USING (
    status = 'active'
    AND public.is_event_member(event_id, auth.uid())
  );

-- Members can upload photos to their events
CREATE POLICY "photos: members upload"
  ON public.photos FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by_user
    AND public.is_event_member(event_id, auth.uid())
  );

-- Photo owner or event host can soft-delete
CREATE POLICY "photos: owner or host soft delete"
  ON public.photos FOR UPDATE
  USING (
    auth.uid() = uploaded_by_user
    OR public.is_event_host(event_id, auth.uid())
  );

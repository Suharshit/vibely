-- ============================================================
-- Row Level Security — all tables
-- auth.uid()   → logged-in user's UUID (from their JWT)
-- auth.role()  → 'anon' | 'authenticated' | 'service_role'
-- service_role → bypasses ALL RLS (API routes only, never client)
-- ============================================================

-- USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: public read"
  ON public.users FOR SELECT USING (TRUE);

CREATE POLICY "users: owner update"
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users: owner delete"
  ON public.users FOR DELETE USING (auth.uid() = id);


-- EVENTS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events: members or public active read"
  ON public.events FOR SELECT
  USING (
    status = 'active'
    OR EXISTS (
      SELECT 1 FROM public.event_members
      WHERE event_id = events.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "events: authenticated create"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "events: host update"
  ON public.events FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "events: host delete"
  ON public.events FOR DELETE USING (auth.uid() = host_id);


-- EVENT_MEMBERS
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_members: members read"
  ON public.event_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.event_members em2
      WHERE em2.event_id = event_members.event_id
        AND em2.user_id = auth.uid()
    )
  );

CREATE POLICY "event_members: self join"
  ON public.event_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_members: host update"
  ON public.event_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.event_members em
      WHERE em.event_id = event_members.event_id
        AND em.user_id = auth.uid()
        AND em.role = 'host'
    )
  );

CREATE POLICY "event_members: host or self delete"
  ON public.event_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.event_members em
      WHERE em.event_id = event_members.event_id
        AND em.user_id = auth.uid()
        AND em.role = 'host'
    )
  );


-- GUEST_SESSIONS (API-only via service_role)
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guest_sessions: service role only"
  ON public.guest_sessions FOR ALL
  USING (auth.role() = 'service_role');


-- PHOTOS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos: event members read"
  ON public.photos FOR SELECT
  USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.event_members em
      WHERE em.event_id = photos.event_id
        AND em.user_id = auth.uid()
    )
  );

CREATE POLICY "photos: members upload"
  ON public.photos FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by_user
    AND EXISTS (
      SELECT 1 FROM public.event_members em
      WHERE em.event_id = photos.event_id
        AND em.user_id = auth.uid()
    )
  );

-- Soft-delete via UPDATE (status = 'deleted')
CREATE POLICY "photos: owner or host soft delete"
  ON public.photos FOR UPDATE
  USING (
    auth.uid() = uploaded_by_user
    OR EXISTS (
      SELECT 1 FROM public.event_members em
      WHERE em.event_id = photos.event_id
        AND em.user_id = auth.uid()
        AND em.role = 'host'
    )
  );

CREATE POLICY "photos: service role full access"
  ON public.photos FOR ALL
  USING (auth.role() = 'service_role');


-- PERSONAL_VAULT
ALTER TABLE public.personal_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vault: owner read"
  ON public.personal_vault FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "vault: owner insert"
  ON public.personal_vault FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vault: owner delete"
  ON public.personal_vault FOR DELETE USING (auth.uid() = user_id);
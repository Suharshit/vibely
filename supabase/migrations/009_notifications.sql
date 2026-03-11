-- ============================================================
-- TABLE: notifications
-- ============================================================
-- Notifications table for alerts when guests upload photos,
-- and members are alerted when new photos are added to their events.
-- ============================================================

CREATE TYPE notification_type AS ENUM ('photo_uploaded', 'member_joined', 'event_expiring');

CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  event_id    UUID REFERENCES public.events(id) ON DELETE CASCADE,
  photo_id    UUID REFERENCES public.photos(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_notifications_user_read_created ON public.notifications(user_id, is_read, created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: users can only SELECT their own notifications
CREATE POLICY select_own_notifications ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can only UPDATE their own notifications
CREATE POLICY update_own_notifications ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

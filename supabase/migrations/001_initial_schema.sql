-- ============================================================
-- EXTENSIONS
-- uuid-ossp: gen_random_uuid() for primary keys
-- moddatetime: auto-updates updated_at columns
-- ============================================================
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";


-- ============================================================
-- TABLE: users
-- ============================================================
-- WHY separate from auth.users?
-- Supabase Auth owns the auth.* schema. We mirror it here
-- with a public profile table WE control. The ID is shared.
-- ============================================================
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  avatar_url    TEXT,
  bio           TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'email'
                  CHECK (auth_provider IN ('email', 'google')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE INDEX idx_users_email ON public.users(email);


-- ============================================================
-- TABLE: events
-- ============================================================
-- WHY invite_token?
-- We use a short readable token in share links instead of
-- the UUID. This lets us revoke/regenerate tokens without
-- changing the event's primary key.
-- ============================================================
CREATE TABLE public.events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT,
  cover_image_url   TEXT,
  host_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invite_token      TEXT NOT NULL UNIQUE,
  event_date        TIMESTAMPTZ NOT NULL,
  expires_at        TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'expired', 'archived')),
  upload_permission TEXT NOT NULL DEFAULT 'open'
                      CHECK (upload_permission IN ('open', 'restricted')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE INDEX idx_events_host_id      ON public.events(host_id);
CREATE INDEX idx_events_invite_token ON public.events(invite_token);
CREATE INDEX idx_events_expires_at   ON public.events(expires_at);
CREATE INDEX idx_events_status       ON public.events(status);


-- ============================================================
-- TABLE: event_members
-- ============================================================
CREATE TABLE public.event_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'contributor'
               CHECK (role IN ('host', 'contributor', 'viewer')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_guest   BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_members_event_id ON public.event_members(event_id);
CREATE INDEX idx_event_members_user_id  ON public.event_members(user_id);


-- ============================================================
-- TABLE: guest_sessions
-- ============================================================
-- Guests don't create accounts. We issue a signed token stored
-- in localStorage/AsyncStorage. Every guest API call passes
-- this token for server-side validation.
-- ============================================================
CREATE TABLE public.guest_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  display_name  TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guest_sessions_token    ON public.guest_sessions(session_token);
CREATE INDEX idx_guest_sessions_event_id ON public.guest_sessions(event_id);


-- ============================================================
-- TABLE: photos
-- ============================================================
-- WHY two nullable uploader columns instead of polymorphic?
-- Explicit FK columns are easier to query and enforce with
-- constraints. The XOR CHECK ensures exactly one is set.
--
-- WHY storage_key instead of full URL?
-- Bucket URLs change when you migrate providers. We store
-- relative paths and construct full URLs at read time.
-- ============================================================
CREATE TABLE public.photos (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id             UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  uploaded_by_user     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  uploaded_by_guest    UUID REFERENCES public.guest_sessions(id) ON DELETE SET NULL,
  storage_key          TEXT NOT NULL,
  thumbnail_key        TEXT NOT NULL,
  original_filename    TEXT NOT NULL,
  file_size            INTEGER NOT NULL CHECK (file_size > 0),
  status               TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'deleted', 'archived')),
  is_saved_to_vault    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at           TIMESTAMPTZ,
  CONSTRAINT exactly_one_uploader CHECK (
    (uploaded_by_user IS NOT NULL AND uploaded_by_guest IS NULL) OR
    (uploaded_by_user IS NULL     AND uploaded_by_guest IS NOT NULL)
  )
);

CREATE INDEX idx_photos_event_id          ON public.photos(event_id);
CREATE INDEX idx_photos_uploaded_by_user  ON public.photos(uploaded_by_user);
CREATE INDEX idx_photos_status            ON public.photos(status);
CREATE INDEX idx_photos_is_saved_to_vault ON public.photos(is_saved_to_vault);


-- ============================================================
-- TABLE: personal_vault
-- ============================================================
-- WHY a junction table rather than a flag on photos?
-- Multiple users can save the same photo. A junction table
-- correctly models this many-to-many relationship.
-- ============================================================
CREATE TABLE public.personal_vault (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  photo_id  UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  saved_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, photo_id)
);

CREATE INDEX idx_personal_vault_user_id  ON public.personal_vault(user_id);
CREATE INDEX idx_personal_vault_photo_id ON public.personal_vault(photo_id);


-- ============================================================
-- TRIGGER: auto-create public.users row on auth signup
-- ============================================================
-- WHY SECURITY DEFINER?
-- This function runs with the privileges of its OWNER (postgres)
-- not the calling user. Required because inserting into
-- public.users from an auth trigger needs elevated access.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, auth_provider)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    CASE
      WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'
      ELSE 'email'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- TRIGGER: auto-add host as event member on event creation
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_host_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.event_members (event_id, user_id, role, is_guest)
  VALUES (NEW.id, NEW.host_id, 'host', FALSE)
  ON CONFLICT (event_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_event_created
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE PROCEDURE public.add_host_as_member();


-- ============================================================
-- TRIGGER: keep is_saved_to_vault in sync with personal_vault
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_vault_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.photos SET is_saved_to_vault = TRUE WHERE id = NEW.photo_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.photos
    SET is_saved_to_vault = EXISTS (
      SELECT 1 FROM public.personal_vault WHERE photo_id = OLD.photo_id
    )
    WHERE id = OLD.photo_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vault_change
  AFTER INSERT OR DELETE ON public.personal_vault
  FOR EACH ROW EXECUTE PROCEDURE public.sync_vault_flag();
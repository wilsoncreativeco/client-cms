-- ============================================================
-- 001_initial_schema.sql
-- Run in Supabase SQL editor or via `supabase db push`
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CLIENTS (tenants)
-- ============================================================
CREATE TABLE public.clients (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  custom_domain TEXT        UNIQUE,
  plan          TEXT        NOT NULL DEFAULT 'starter'
                            CHECK (plan IN ('starter', 'pro', 'enterprise')),
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  settings      JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PROFILES (extends auth.users 1-to-1)
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT        NOT NULL DEFAULT 'client'
                          CHECK (role IN ('admin', 'client')),
  client_id   UUID        REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PAGES
-- ============================================================
CREATE TABLE public.pages (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id       UUID        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  slug            TEXT        NOT NULL,
  seo_title       TEXT,
  seo_description TEXT,
  seo_og_image    TEXT,
  status          TEXT        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft', 'published')),
  published_at    TIMESTAMPTZ,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, slug)
);

-- ============================================================
-- CONTENT BLOCKS
-- ============================================================
CREATE TABLE public.content_blocks (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id    UUID        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  page_id      UUID        NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  block_type   TEXT        NOT NULL
                           CHECK (block_type IN (
                             'hero', 'about', 'services', 'gallery',
                             'testimonials', 'faq', 'cta', 'contact', 'richtext'
                           )),
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  visible      BOOLEAN     NOT NULL DEFAULT true,
  content_json JSONB       NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MEDIA
-- ============================================================
CREATE TABLE public.media (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id    UUID        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  file_url     TEXT        NOT NULL,
  file_name    TEXT        NOT NULL,
  file_size    INTEGER,
  mime_type    TEXT,
  storage_path TEXT        NOT NULL,
  alt_text     TEXT,
  uploaded_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE public.audit_logs (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     UUID        REFERENCES public.clients(id) ON DELETE SET NULL,
  user_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  action        TEXT        NOT NULL,
  resource_type TEXT,
  resource_id   UUID,
  metadata      JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_client_id     ON public.profiles(client_id);
CREATE INDEX idx_profiles_role          ON public.profiles(role);
CREATE INDEX idx_pages_client_id        ON public.pages(client_id);
CREATE INDEX idx_pages_status           ON public.pages(status);
CREATE INDEX idx_content_blocks_page    ON public.content_blocks(page_id);
CREATE INDEX idx_content_blocks_client  ON public.content_blocks(client_id);
CREATE INDEX idx_content_blocks_order   ON public.content_blocks(page_id, sort_order);
CREATE INDEX idx_media_client_id        ON public.media(client_id);
CREATE INDEX idx_audit_logs_client      ON public.audit_logs(client_id);
CREATE INDEX idx_audit_logs_user        ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created     ON public.audit_logs(created_at DESC);

-- ============================================================
-- updated_at TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGN-UP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security — strict tenant isolation
-- ============================================================

-- Enable RLS on all tenant tables
ALTER TABLE public.clients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS (SECURITY DEFINER — bypass RLS for lookups)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS UUID AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- CLIENTS POLICIES
-- ============================================================

-- Admins see all clients
CREATE POLICY "admin_select_clients" ON public.clients
  FOR SELECT
  USING (public.is_admin());

-- Client users see only their own client record
CREATE POLICY "client_select_own" ON public.clients
  FOR SELECT
  USING (id = public.get_my_client_id());

-- Only admins can insert/update/delete clients
CREATE POLICY "admin_insert_clients" ON public.clients
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_clients" ON public.clients
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "admin_delete_clients" ON public.clients
  FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- One consolidated SELECT policy covers all three cases:
--   1. A user always sees their own profile
--   2. An admin sees all profiles
--   3. A client user sees teammates (same client_id) — powers the Users page
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR public.is_admin()
    OR (client_id IS NOT NULL AND client_id = public.get_my_client_id())
  );

-- Users can update their own profile (name, avatar only — role/client_id protected)
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- prevent self-escalation: role and client_id can only be set by admin
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND client_id IS NOT DISTINCT FROM (SELECT client_id FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can insert new profiles (when creating users)
CREATE POLICY "admin_insert_profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update any profile
CREATE POLICY "admin_update_profiles" ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- PAGES POLICIES
-- ============================================================

-- Admins see all pages
CREATE POLICY "admin_all_pages" ON public.pages
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Client users see only their own client's pages
CREATE POLICY "client_select_pages" ON public.pages
  FOR SELECT
  USING (client_id = public.get_my_client_id());

CREATE POLICY "client_insert_pages" ON public.pages
  FOR INSERT
  WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "client_update_pages" ON public.pages
  FOR UPDATE
  USING (client_id = public.get_my_client_id())
  WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "client_delete_pages" ON public.pages
  FOR DELETE
  USING (client_id = public.get_my_client_id());

-- ============================================================
-- CONTENT BLOCKS POLICIES
-- ============================================================

CREATE POLICY "admin_all_blocks" ON public.content_blocks
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "client_select_blocks" ON public.content_blocks
  FOR SELECT
  USING (client_id = public.get_my_client_id());

CREATE POLICY "client_insert_blocks" ON public.content_blocks
  FOR INSERT
  WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "client_update_blocks" ON public.content_blocks
  FOR UPDATE
  USING (client_id = public.get_my_client_id())
  WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "client_delete_blocks" ON public.content_blocks
  FOR DELETE
  USING (client_id = public.get_my_client_id());

-- ============================================================
-- MEDIA POLICIES
-- ============================================================

CREATE POLICY "admin_all_media" ON public.media
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "client_select_media" ON public.media
  FOR SELECT
  USING (client_id = public.get_my_client_id());

CREATE POLICY "client_insert_media" ON public.media
  FOR INSERT
  WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "client_delete_media" ON public.media
  FOR DELETE
  USING (client_id = public.get_my_client_id() AND uploaded_by = auth.uid());

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================

-- Admins see all logs
CREATE POLICY "admin_select_audit" ON public.audit_logs
  FOR SELECT
  USING (public.is_admin());

-- Client users see only their own audit logs
CREATE POLICY "client_select_audit" ON public.audit_logs
  FOR SELECT
  USING (client_id = public.get_my_client_id());

-- Any authenticated user can insert audit logs (write-only for own client)
CREATE POLICY "insert_own_audit" ON public.audit_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      public.is_admin()
      OR client_id = public.get_my_client_id()
    )
  );

-- Nobody can update or delete audit logs
-- (no UPDATE/DELETE policies = denied by default)

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run after creating buckets in Supabase dashboard:
-- Bucket: "media" — private

-- ┌─────────────────────────────────────────────────────────────┐
-- │  Bucket is PUBLIC so getPublicUrl() works on client sites.  │
-- │  Upload and delete are still RLS-controlled below.          │
-- │  Files are stored at: {client_id}/{filename}                │
-- └─────────────────────────────────────────────────────────────┘
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,                -- public: URLs are directly accessible (required for client sites)
  52428800,            -- 50 MB per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Only authenticated users belonging to the correct client can upload
CREATE POLICY "media_upload_own_client" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.uid() IS NOT NULL
    AND (
      public.is_admin()
      OR (string_to_array(name, '/'))[1] = public.get_my_client_id()::TEXT
    )
  );

-- Only the owning client (or admin) can delete their files
CREATE POLICY "media_delete_own_client" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'media'
    AND (
      public.is_admin()
      OR (string_to_array(name, '/'))[1] = public.get_my_client_id()::TEXT
    )
  );

-- No SELECT policy needed — public bucket allows read for everyone.
-- The `media` metadata table is still RLS-protected (clients only see their own rows).

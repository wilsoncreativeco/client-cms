-- ============================================================
-- 003_public_api.sql
-- Public read-only functions for client website integration
-- Called by client sites via anon key — no auth required
-- ============================================================

-- Returns published page data for a client slug + page slug
CREATE OR REPLACE FUNCTION public.get_page_content(
  p_client_slug TEXT,
  p_page_slug   TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_client_id UUID;
  v_page      JSONB;
  v_blocks    JSONB;
BEGIN
  -- resolve client
  SELECT id INTO v_client_id
  FROM public.clients
  WHERE slug = p_client_slug AND is_active = true;

  IF v_client_id IS NULL THEN
    RETURN jsonb_build_object('error', 'client_not_found');
  END IF;

  -- resolve published page
  SELECT jsonb_build_object(
    'id',              p.id,
    'name',            p.name,
    'slug',            p.slug,
    'seo_title',       p.seo_title,
    'seo_description', p.seo_description,
    'seo_og_image',    p.seo_og_image
  ) INTO v_page
  FROM public.pages p
  WHERE p.client_id = v_client_id
    AND p.slug      = p_page_slug
    AND p.status    = 'published';

  IF v_page IS NULL THEN
    RETURN jsonb_build_object('error', 'page_not_found');
  END IF;

  -- fetch visible blocks ordered by sort_order
  SELECT jsonb_agg(
    jsonb_build_object(
      'id',           cb.id,
      'block_type',   cb.block_type,
      'sort_order',   cb.sort_order,
      'content_json', cb.content_json
    )
    ORDER BY cb.sort_order
  ) INTO v_blocks
  FROM public.content_blocks cb
  JOIN public.pages p ON p.id = cb.page_id
  WHERE p.client_id = v_client_id
    AND p.slug      = p_page_slug
    AND p.status    = 'published'
    AND cb.visible  = true;

  RETURN jsonb_build_object(
    'page',   v_page,
    'blocks', COALESCE(v_blocks, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Returns all published pages for a client (nav generation)
CREATE OR REPLACE FUNCTION public.get_client_pages(p_client_slug TEXT)
RETURNS JSONB AS $$
DECLARE
  v_client_id UUID;
  v_pages     JSONB;
BEGIN
  SELECT id INTO v_client_id
  FROM public.clients
  WHERE slug = p_client_slug AND is_active = true;

  IF v_client_id IS NULL THEN
    RETURN jsonb_build_object('error', 'client_not_found');
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id',    p.id,
      'name',  p.name,
      'slug',  p.slug
    )
    ORDER BY p.sort_order
  ) INTO v_pages
  FROM public.pages p
  WHERE p.client_id = v_client_id
    AND p.status    = 'published';

  RETURN jsonb_build_object('pages', COALESCE(v_pages, '[]'::jsonb));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant anon/authenticated access to these functions
GRANT EXECUTE ON FUNCTION public.get_page_content(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_pages(TEXT)       TO anon, authenticated;

-- ============================================================================
-- CRITICAL: Fix login resolver — run THIS file alone in Supabase SQL Editor
-- Restores Super Admin and all org logins.
-- ============================================================================

DROP FUNCTION IF EXISTS public.resolve_login(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.resolve_login(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.resolve_login(VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS public.resolve_login(character varying, character varying) CASCADE;

CREATE FUNCTION public.resolve_login(
  p_org_code TEXT,
  p_username TEXT
)
RETURNS TABLE (
  email TEXT,
  user_status TEXT,
  organization_status TEXT,
  company_name TEXT,
  organization_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT := upper(trim(COALESCE(p_org_code, '')));
  v_uname TEXT := lower(trim(COALESCE(p_username, '')));
BEGIN
  -- A) Match org code + username on public.users (normal staff / org admin)
  RETURN QUERY
  SELECT
    u.email::TEXT,
    COALESCE(u.status, 'Active')::TEXT,
    COALESCE(o.status, 'Active')::TEXT,
    COALESCE(o.company_name, 'Organisation')::TEXT,
    u.organization_id
  FROM public.users AS u
  INNER JOIN public.organizations AS o ON o.id = u.organization_id
  WHERE upper(o.organization_code) = v_code
    AND (
      lower(u.username) = v_uname
      OR lower(u.email) = v_uname
      OR lower(split_part(u.email, '@', 1)) = v_uname
    )
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- B) Super Admin by username (any org code — keeps previous SUPER / blank / custom working)
  RETURN QUERY
  SELECT
    u.email::TEXT,
    COALESCE(u.status, 'Active')::TEXT,
    'Active'::TEXT,
    'Umhlaba Wami Platform'::TEXT,
    u.organization_id
  FROM public.users AS u
  WHERE u.role = 'super_admin'
    AND (
      lower(u.username) = v_uname
      OR lower(u.email) = v_uname
      OR lower(split_part(u.email, '@', 1)) = v_uname
    )
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- C) Org row fallback (preferred_username / owner email before public.users existed)
  RETURN QUERY
  SELECT
    o.email::TEXT,
    'Active'::TEXT,
    o.status::TEXT,
    o.company_name::TEXT,
    o.id
  FROM public.organizations AS o
  WHERE upper(o.organization_code) = v_code
    AND (
      lower(COALESCE(o.preferred_username, '')) = v_uname
      OR lower(split_part(o.email, '@', 1)) = v_uname
      OR lower(o.email) = v_uname
    )
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_login(TEXT, TEXT) TO service_role;

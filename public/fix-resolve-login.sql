-- ============================================================================
-- CRITICAL: Fix login resolver (run this FIRST — alone is enough to restore login)
-- ============================================================================

-- Drop every known signature (TEXT / varchar). Must succeed before CREATE.
DROP FUNCTION IF EXISTS public.resolve_login(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.resolve_login(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.resolve_login(VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS public.resolve_login(character varying, character varying) CASCADE;

-- Recreate with RETURN QUERY (no OUT-parameter name clashes)
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
  -- 1) Super Admin: special codes or users with role super_admin and no org filter
  IF v_code IN ('SUPER', 'PLATFORM', 'SUPERADMIN', 'ADMIN', 'SA', 'UW-SUPER') THEN
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
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  -- 2) Any user whose organisation_code matches (including super_admin tied to an org code)
  RETURN QUERY
  SELECT
    u.email::TEXT,
    COALESCE(u.status, 'Active')::TEXT,
    COALESCE(o.status, 'Active')::TEXT,
    COALESCE(o.company_name, 'Organisation')::TEXT,
    u.organization_id
  FROM public.users AS u
  LEFT JOIN public.organizations AS o ON o.id = u.organization_id
  WHERE (
      upper(COALESCE(o.organization_code, '')) = v_code
      OR (u.role = 'super_admin' AND v_code IN ('SUPER', 'PLATFORM', 'SUPERADMIN', 'ADMIN', 'SA', 'UW-SUPER'))
    )
    AND (
      lower(u.username) = v_uname
      OR lower(u.email) = v_uname
      OR lower(split_part(u.email, '@', 1)) = v_uname
    )
  LIMIT 1;

  IF FOUND THEN
    RETURN;
  END IF;

  -- 3) Fallback: org preferred_username / owner email (before public.users existed)
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

-- Quick self-check (optional): should not error
-- SELECT * FROM public.resolve_login('SUPER', 'your_super_username');

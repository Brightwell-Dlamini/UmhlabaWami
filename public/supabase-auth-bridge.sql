-- ============================================================================
-- UMHLABA WAMI — Auth bridge for Organisation Code + Username login under RLS
-- Run AFTER: public/supabase-schema.sql (+ optional seed)
--
-- Problem: login must look up org/user BEFORE a session exists, but RLS only
-- allows SELECT for authenticated. This SECURITY DEFINER function resolves
-- credentials without exposing full user tables to anon.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.resolve_login(
  p_org_code text,
  p_username text
)
RETURNS TABLE (
  email text,
  user_id uuid,
  user_role text,
  user_status text,
  organization_id uuid,
  organization_code text,
  organization_status text,
  company_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_code text := upper(trim(p_org_code));
  v_username text := lower(trim(p_username));
BEGIN
  -- Super Admin path
  IF v_username = 'superadmin' OR v_org_code IN ('SUPER', 'ADMIN') THEN
    RETURN QUERY
    SELECT
      u.email::text,
      u.id,
      u.role::text,
      u.status::text,
      u.organization_id,
      'SUPER'::text,
      'Active'::text,
      'Umhlaba Wami Platform'::text
    FROM users u
    WHERE u.role = 'super_admin'
      AND u.status = 'Active'
    LIMIT 1;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    u.email::text,
    u.id,
    u.role::text,
    u.status::text,
    o.id,
    o.organization_code::text,
    o.status::text,
    o.company_name::text
  FROM organizations o
  JOIN users u ON u.organization_id = o.id
  WHERE upper(o.organization_code) = v_org_code
    AND (lower(u.username) = v_username OR lower(u.email) = v_username)
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_login(text, text) TO anon, authenticated;

COMMENT ON FUNCTION public.resolve_login IS
  'Pre-auth login resolver: org code + username → email for Supabase Auth sign-in';

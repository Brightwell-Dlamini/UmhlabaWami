-- ============================================================================
-- Org admin + staff login helpers
-- If login is broken, run public/fix-resolve-login.sql FIRST, then this file.
-- ============================================================================

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS preferred_username VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS registration_notes TEXT;

-- Always drop resolve_login before recreate (return type / OUT params)
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
    IF FOUND THEN RETURN; END IF;
  END IF;

  RETURN QUERY
  SELECT
    u.email::TEXT,
    COALESCE(u.status, 'Active')::TEXT,
    COALESCE(o.status, 'Active')::TEXT,
    COALESCE(o.company_name, 'Organisation')::TEXT,
    u.organization_id
  FROM public.users AS u
  LEFT JOIN public.organizations AS o ON o.id = u.organization_id
  WHERE upper(COALESCE(o.organization_code, '')) = v_code
    AND (
      lower(u.username) = v_uname
      OR lower(u.email) = v_uname
      OR lower(split_part(u.email, '@', 1)) = v_uname
    )
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

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

CREATE OR REPLACE FUNCTION public.bootstrap_org_admin_user(
  p_org_id UUID,
  p_auth_user_id UUID DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'Active'
)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org organizations;
  v_user public.users;
  v_username TEXT;
  v_email TEXT;
  v_name TEXT;
  v_phone TEXT;
BEGIN
  SELECT * INTO v_org FROM organizations WHERE id = p_org_id;
  IF v_org IS NULL THEN RAISE EXCEPTION 'Organization not found'; END IF;

  v_email := lower(trim(COALESCE(NULLIF(p_email, ''), v_org.email)));
  v_username := lower(trim(COALESCE(
    NULLIF(p_username, ''),
    NULLIF(v_org.preferred_username, ''),
    split_part(v_email, '@', 1)
  )));
  v_name := COALESCE(NULLIF(trim(p_name), ''), v_org.owner_name, 'Organisation Admin');
  v_phone := COALESCE(NULLIF(trim(p_phone), ''), v_org.phone);

  SELECT * INTO v_user FROM public.users WHERE lower(email) = v_email LIMIT 1;

  IF v_user IS NOT NULL THEN
    UPDATE public.users SET
      organization_id = p_org_id,
      username = v_username,
      name = v_name,
      phone = COALESCE(v_phone, phone),
      role = COALESCE(role, 'admin'),
      status = COALESCE(NULLIF(trim(p_status), ''), 'Active')
    WHERE id = v_user.id
    RETURNING * INTO v_user;
    RETURN v_user;
  END IF;

  IF p_auth_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, organization_id, username, name, email, phone, role, status)
    VALUES (
      p_auth_user_id, p_org_id, v_username, v_name, v_email, v_phone, 'admin',
      COALESCE(NULLIF(trim(p_status), ''), 'Active')
    )
    ON CONFLICT (id) DO UPDATE SET
      organization_id = EXCLUDED.organization_id,
      username = EXCLUDED.username,
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      role = 'admin',
      status = EXCLUDED.status
    RETURNING * INTO v_user;
  ELSE
    INSERT INTO public.users (organization_id, username, name, email, phone, role, status)
    VALUES (
      p_org_id, v_username, v_name, v_email, v_phone, 'admin',
      COALESCE(NULLIF(trim(p_status), ''), 'Active')
    )
    RETURNING * INTO v_user;
  END IF;
  RETURN v_user;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_org_admin_user(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT)
  TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.bootstrap_staff_user(
  p_org_id UUID,
  p_auth_user_id UUID DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'property_manager',
  p_status TEXT DEFAULT 'Active'
)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user public.users;
  v_username TEXT;
  v_email TEXT;
  v_name TEXT;
  v_role TEXT;
BEGIN
  v_email := lower(trim(p_email));
  IF v_email IS NULL OR v_email = '' THEN RAISE EXCEPTION 'Email required'; END IF;
  v_username := lower(trim(COALESCE(NULLIF(p_username, ''), split_part(v_email, '@', 1))));
  v_name := COALESCE(NULLIF(trim(p_name), ''), v_username);
  v_role := COALESCE(NULLIF(trim(p_role), ''), 'property_manager');

  SELECT * INTO v_user FROM public.users WHERE lower(email) = v_email LIMIT 1;

  IF v_user IS NOT NULL THEN
    UPDATE public.users SET
      organization_id = p_org_id,
      username = v_username,
      name = v_name,
      phone = COALESCE(NULLIF(trim(p_phone), ''), phone),
      role = v_role,
      status = COALESCE(NULLIF(trim(p_status), ''), 'Active')
    WHERE id = v_user.id
    RETURNING * INTO v_user;
    RETURN v_user;
  END IF;

  IF p_auth_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, organization_id, username, name, email, phone, role, status)
    VALUES (
      p_auth_user_id, p_org_id, v_username, v_name, v_email,
      NULLIF(trim(p_phone), ''), v_role,
      COALESCE(NULLIF(trim(p_status), ''), 'Active')
    )
    ON CONFLICT (id) DO UPDATE SET
      organization_id = EXCLUDED.organization_id,
      username = EXCLUDED.username,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      status = EXCLUDED.status
    RETURNING * INTO v_user;
  ELSE
    INSERT INTO public.users (organization_id, username, name, email, phone, role, status)
    VALUES (
      p_org_id, v_username, v_name, v_email,
      NULLIF(trim(p_phone), ''), v_role,
      COALESCE(NULLIF(trim(p_status), ''), 'Active')
    )
    RETURNING * INTO v_user;
  END IF;
  RETURN v_user;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_staff_user(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT)
  TO authenticated;

DO $$ BEGIN
  DROP POLICY IF EXISTS users_insert_bootstrap ON users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY users_insert_bootstrap ON users
  FOR INSERT TO authenticated, anon WITH CHECK (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS users_update_self_or_admin ON users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY users_update_self_or_admin ON users
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;

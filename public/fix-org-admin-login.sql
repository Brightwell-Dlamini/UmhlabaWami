-- ============================================================================
-- FIX: Organisation admin login (Auth + public.users)
-- Run this entire script in Supabase SQL Editor once.
-- ============================================================================

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS preferred_username VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS registration_notes TEXT;

-- Ensure users table can accept inserts (id may or may not FK to auth.users)
-- Many projects use: id UUID PRIMARY KEY DEFAULT gen_random_uuid()
-- If id references auth.users, bootstrap must use the Auth user UUID.

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
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;

  v_email := lower(trim(COALESCE(NULLIF(p_email, ''), v_org.email)));
  v_username := lower(trim(COALESCE(
    NULLIF(p_username, ''),
    NULLIF(v_org.preferred_username, ''),
    split_part(v_email, '@', 1)
  )));
  v_name := COALESCE(NULLIF(trim(p_name), ''), v_org.owner_name, 'Organisation Admin');
  v_phone := COALESCE(NULLIF(trim(p_phone), ''), v_org.phone);

  -- Prefer match by email
  SELECT * INTO v_user FROM public.users WHERE lower(email) = v_email LIMIT 1;

  IF v_user IS NOT NULL THEN
    UPDATE public.users SET
      organization_id = p_org_id,
      username = v_username,
      name = v_name,
      phone = COALESCE(v_phone, phone),
      role = 'admin',
      status = COALESCE(NULLIF(trim(p_status), ''), 'Active')
    WHERE id = v_user.id
    RETURNING * INTO v_user;
    RETURN v_user;
  END IF;

  -- Insert new profile (use Auth UUID when provided so it matches auth.users)
  IF p_auth_user_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, organization_id, username, name, email, phone, role, status
    ) VALUES (
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
    INSERT INTO public.users (
      organization_id, username, name, email, phone, role, status
    ) VALUES (
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

-- Login resolver: org code + username → email (works before session)
CREATE OR REPLACE FUNCTION public.resolve_login(
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
  v_org organizations;
  v_user public.users;
  v_code TEXT := upper(trim(p_org_code));
  v_uname TEXT := lower(trim(p_username));
BEGIN
  SELECT * INTO v_org
  FROM organizations
  WHERE upper(organization_code) = v_code
  LIMIT 1;

  IF v_org IS NULL THEN
    RETURN;
  END IF;

  -- Match username on public.users for this org
  SELECT * INTO v_user
  FROM public.users
  WHERE organization_id = v_org.id
    AND (
      lower(username) = v_uname
      OR lower(email) = v_uname
      OR lower(split_part(email, '@', 1)) = v_uname
    )
  LIMIT 1;

  -- Fallback: preferred_username or email local-part on the organisation itself
  IF v_user IS NULL THEN
    IF (
      lower(COALESCE(v_org.preferred_username, '')) = v_uname
      OR lower(split_part(v_org.email, '@', 1)) = v_uname
      OR lower(v_org.email) = v_uname
    ) THEN
      email := v_org.email;
      user_status := 'Active';
      organization_status := v_org.status;
      company_name := v_org.company_name;
      organization_id := v_org.id;
      RETURN NEXT;
      RETURN;
    END IF;
    RETURN;
  END IF;

  email := v_user.email;
  user_status := v_user.status;
  organization_status := v_org.status;
  company_name := v_org.company_name;
  organization_id := v_org.id;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_login(TEXT, TEXT) TO anon, authenticated;

-- RLS helpers for users insert (bootstrap uses SECURITY DEFINER anyway)
DO $$ BEGIN
  DROP POLICY IF EXISTS users_insert_bootstrap ON users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY users_insert_bootstrap ON users
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS users_update_self_or_admin ON users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY users_update_self_or_admin ON users
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;

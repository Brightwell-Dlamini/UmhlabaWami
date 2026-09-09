-- ============================================================================
-- UMHLABA WAMI — Sync Supabase Auth → public.users
-- Run this in the SQL Editor BEFORE creating Auth users.
--
-- Why Auth users did not appear in public.users:
-- Authentication writes to auth.users only. The app reads public.users.
-- This trigger creates or updates the app profile on every Auth signup.
-- ============================================================================

DROP POLICY IF EXISTS users_insert_admin ON public.users;
CREATE POLICY users_insert_admin ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() IN ('admin', 'super_admin')
    OR email = auth.jwt() ->> 'email'
  );

DROP POLICY IF EXISTS users_delete_admin ON public.users;
CREATE POLICY users_delete_admin ON public.users
  FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('admin', 'super_admin'));

CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_name TEXT;
  v_role TEXT;
  v_org UUID;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(COALESCE(NEW.email, 'user'), '@', 1)
  );
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    v_username
  );
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'tenant');
  IF v_role NOT IN ('tenant','property_manager','maintenance','finance','admin','super_admin') THEN
    v_role := 'tenant';
  END IF;

  BEGIN
    IF NEW.raw_user_meta_data ? 'organization_id'
       AND COALESCE(NEW.raw_user_meta_data->>'organization_id', '') <> '' THEN
      v_org := (NEW.raw_user_meta_data->>'organization_id')::UUID;
    ELSE
      v_org := NULL;
    END IF;
  EXCEPTION WHEN others THEN
    v_org := NULL;
  END;

  IF v_role = 'super_admin' THEN
    v_org := NULL;
  END IF;

  -- Prefer insert with Auth uid. If a UI-created row already has this email,
  -- update profile fields but DO NOT change primary key (avoids FK breakage).
  INSERT INTO public.users AS u (
    id,
    organization_id,
    username,
    name,
    email,
    phone,
    role,
    status,
    created_at
  ) VALUES (
    NEW.id,
    v_org,
    v_username,
    v_name,
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    v_role,
    'Active',
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (email) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, u.username),
    name = COALESCE(EXCLUDED.name, u.name),
    role = CASE
      WHEN EXCLUDED.role IS NOT NULL AND EXCLUDED.role <> 'tenant' THEN EXCLUDED.role
      ELSE u.role
    END,
    organization_id = COALESCE(EXCLUDED.organization_id, u.organization_id),
    phone = COALESCE(EXCLUDED.phone, u.phone),
    status = 'Active';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_created();

COMMENT ON FUNCTION public.handle_auth_user_created() IS
  'Creates or updates public.users when a row is inserted into auth.users';

-- ============================================================================
-- UMHLABA WAMI — Sync Supabase Auth → public.users
-- Run in SQL Editor AFTER creating users in Authentication.
--
-- Why Auth users did not appear in public.users:
-- Auth (auth.users) and app profiles (public.users) are separate tables.
-- Nothing was copying rows across until this trigger.
-- ============================================================================

-- Allow admins / super_admin to insert staff profiles from the app
DROP POLICY IF EXISTS users_insert_admin ON public.users;
CREATE POLICY users_insert_admin ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() IN ('admin', 'super_admin')
    OR email = auth.jwt() ->> 'email'
  );

-- Super admin may delete staff profiles (not themselves via UI usually)
DROP POLICY IF EXISTS users_delete_admin ON public.users;
CREATE POLICY users_delete_admin ON public.users
  FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- Trigger: every new Auth user gets / links a public.users profile
-- ---------------------------------------------------------------------------
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
    split_part(NEW.email, '@', 1)
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

  -- Optional org from metadata (UUID string)
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

  -- Super admin has no organisation
  IF v_role = 'super_admin' THEN
    v_org := NULL;
  END IF;

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
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    v_role,
    'Active',
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (email) DO UPDATE SET
    -- Link existing profile (created from UI) to this Auth uid
    id = EXCLUDED.id,
    username = COALESCE(EXCLUDED.username, u.username),
    name = COALESCE(EXCLUDED.name, u.name),
    role = COALESCE(EXCLUDED.role, u.role),
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

-- ---------------------------------------------------------------------------
-- Clean seeded demo users from public.users (keeps orgs / units)
-- Run once when switching to Auth-first user management.
-- ---------------------------------------------------------------------------
-- Uncomment and run after you have decided to wipe seed staff:
--
-- DELETE FROM public.users
-- WHERE email IN (
--   'admin@umhlabawami.sz',
--   'lindiwe@ezulwiniproperties.sz',
--   'sipho@ezulwiniproperties.sz',
--   'nandi@swaziartisancrafts.sz',
--   'bheki@ezulwiniproperties.sz',
--   'thandeka@ezulwiniproperties.sz'
-- )
-- OR id::text LIKE 'usr_%'
-- OR username IN ('superadmin','lindiwe.admin','sipho.manager','nandi.tenant','bheki.maintenance','thandeka.finance');

COMMENT ON FUNCTION public.handle_auth_user_created() IS
  'Creates or links public.users when a row is inserted into auth.users';

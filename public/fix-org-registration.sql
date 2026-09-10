-- ============================================================================
-- FIX: Organisation self-registration + listing_leads
-- Run this on your EXISTING Supabase project (does NOT recreate organizations).
-- ============================================================================

-- 1) Privileges
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 2) Drop every INSERT policy on organizations, then allow pending applications
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'organizations' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON organizations', r.policyname);
  END LOOP;
END $$;

CREATE POLICY organizations_insert_pending
  ON organizations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'Pending Approval');

-- 3) Reliable path: SECURITY DEFINER function (works even if RLS is strict)
CREATE OR REPLACE FUNCTION public.register_organization_application(
  p_company_name TEXT,
  p_owner_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_subscription_tier TEXT DEFAULT 'Starter',
  p_monthly_fee_estimate NUMERIC DEFAULT NULL
)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row organizations;
  v_code TEXT;
BEGIN
  v_code := 'PEND-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO organizations (
    organization_code,
    company_name,
    owner_name,
    email,
    phone,
    address,
    subscription_tier,
    status,
    property_limit,
    tenant_limit,
    user_limit,
    storage_limit,
    monthly_fee_estimate
  ) VALUES (
    v_code,
    p_company_name,
    p_owner_name,
    lower(trim(p_email)),
    p_phone,
    p_address,
    COALESCE(NULLIF(trim(p_subscription_tier), ''), 'Starter'),
    'Pending Approval',
    3,
    100,
    10,
    10,
    p_monthly_fee_estimate
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_organization_application(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC
) TO anon, authenticated;

-- 4) Listing leads table (skip if exists)
CREATE TABLE IF NOT EXISTS listing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_name VARCHAR(255) NOT NULL,
  property_type VARCHAR(100),
  location VARCHAR(255),
  total_units VARCHAR(50),
  owner_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE listing_leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS leads_insert ON listing_leads;
  DROP POLICY IF EXISTS leads_select ON listing_leads;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY leads_insert ON listing_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY leads_select ON listing_leads
  FOR SELECT TO authenticated
  USING (
    COALESCE(public.current_user_role(), '') = 'super_admin'
  );

GRANT SELECT, INSERT ON listing_leads TO anon, authenticated;

-- Done. Test: public registration form should succeed after redeploy.

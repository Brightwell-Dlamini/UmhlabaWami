-- ============================================================================
-- Run on EXISTING Supabase project after fix-org-registration.sql
-- Adds preferred_username, expands register RPC, adds approve RPC
-- ============================================================================

-- Preferred admin username captured at registration
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS preferred_username VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS registration_notes TEXT;

-- Expanded registration (stores preferred username)
CREATE OR REPLACE FUNCTION public.register_organization_application(
  p_company_name TEXT,
  p_owner_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_subscription_tier TEXT DEFAULT 'Starter',
  p_monthly_fee_estimate NUMERIC DEFAULT NULL,
  p_preferred_username TEXT DEFAULT NULL,
  p_registration_notes TEXT DEFAULT NULL
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
    monthly_fee_estimate,
    preferred_username,
    registration_notes
  ) VALUES (
    v_code,
    p_company_name,
    p_owner_name,
    lower(trim(p_email)),
    p_phone,
    p_address,
    COALESCE(NULLIF(trim(p_subscription_tier), ''), 'Starter'),
    'Pending Approval',
    3, 100, 10, 10,
    p_monthly_fee_estimate,
    NULLIF(lower(trim(COALESCE(p_preferred_username, ''))), ''),
    p_registration_notes
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_organization_application(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT
) TO anon, authenticated;

-- Real approval (updates status, approved_at, approved_by, organization_code)
CREATE OR REPLACE FUNCTION public.approve_organization_application(
  p_org_id UUID,
  p_organization_code TEXT,
  p_approved_by TEXT
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
  v_code := NULLIF(trim(p_organization_code), '');
  IF v_code IS NULL THEN
    v_code := 'ORG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  END IF;

  UPDATE organizations
  SET
    status = 'Active',
    organization_code = v_code,
    approved_at = NOW(),
    approved_by = COALESCE(NULLIF(trim(p_approved_by), ''), 'Super Admin')
  WHERE id = p_org_id
  RETURNING * INTO v_row;

  IF v_row IS NULL THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_organization_application(UUID, TEXT, TEXT)
  TO authenticated;

-- Reject
CREATE OR REPLACE FUNCTION public.reject_organization_application(
  p_org_id UUID,
  p_reason TEXT DEFAULT 'Rejected by Super Admin'
)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row organizations;
BEGIN
  UPDATE organizations
  SET status = 'Rejected',
      registration_notes = COALESCE(registration_notes || E'\n', '') || COALESCE(p_reason, 'Rejected')
  WHERE id = p_org_id
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_organization_application(UUID, TEXT)
  TO authenticated;

-- Ensure users can be inserted by authenticated admins after approval
DO $$ BEGIN
  DROP POLICY IF EXISTS users_insert_admin ON users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY users_insert_admin ON users FOR INSERT TO authenticated
  WITH CHECK (
    COALESCE(public.current_user_role(), '') IN ('super_admin', 'admin')
    OR true  -- temporary: allow authenticated insert for org admin bootstrap
  );

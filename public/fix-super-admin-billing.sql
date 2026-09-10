-- Super Admin can update organisation billing / limits on existing DB
-- Safe to re-run

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS preferred_username VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS registration_notes TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS custom_monthly_fee NUMERIC(12, 2);

-- Allow authenticated super_admin (and any authenticated for SECURITY DEFINER path) to update orgs
DO $$ BEGIN
  DROP POLICY IF EXISTS org_update_super ON organizations;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY org_update_super ON organizations
  FOR UPDATE TO authenticated
  USING (
    COALESCE(public.current_user_role(), '') = 'super_admin'
    OR true
  );

CREATE OR REPLACE FUNCTION public.update_organization_billing(
  p_org_id UUID,
  p_subscription_tier TEXT DEFAULT NULL,
  p_monthly_fee NUMERIC DEFAULT NULL,
  p_property_limit INT DEFAULT NULL,
  p_tenant_limit INT DEFAULT NULL,
  p_user_limit INT DEFAULT NULL,
  p_storage_limit INT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_updated_by TEXT DEFAULT 'Super Admin'
)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row organizations;
BEGIN
  UPDATE organizations SET
    subscription_tier = COALESCE(NULLIF(trim(p_subscription_tier), ''), subscription_tier),
    monthly_fee_estimate = COALESCE(p_monthly_fee, monthly_fee_estimate),
    custom_monthly_fee = COALESCE(p_monthly_fee, custom_monthly_fee),
    property_limit = COALESCE(p_property_limit, property_limit),
    tenant_limit = COALESCE(p_tenant_limit, tenant_limit),
    user_limit = COALESCE(p_user_limit, user_limit),
    storage_limit = COALESCE(p_storage_limit, storage_limit),
    status = COALESCE(NULLIF(trim(p_status), ''), status)
  WHERE id = p_org_id
  RETURNING * INTO v_row;

  IF v_row IS NULL THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_organization_billing(
  UUID, TEXT, NUMERIC, INT, INT, INT, INT, TEXT, TEXT
) TO authenticated;

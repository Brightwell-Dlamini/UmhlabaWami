-- ============================================================================
-- UMHLABA WAMI — Phase 3–7 schema extensions
-- Run AFTER public/supabase-schema.sql in Supabase SQL Editor.
-- Maps app dual-mode / localStorage entities to Postgres for production cutover.
-- ============================================================================

-- Phase 3 — Ops
CREATE TABLE IF NOT EXISTS sla_matrices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rules JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (organization_id)
);

CREATE TABLE IF NOT EXISTS preventive_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  shopping_center_id UUID REFERENCES shopping_centers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category VARCHAR(100),
  frequency VARCHAR(50),
  next_due DATE,
  assigned_to_name VARCHAR(255),
  preferred_vendor_id UUID,
  status VARCHAR(50) DEFAULT 'Scheduled',
  last_completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  service_category VARCHAR(255),
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  assigned_property_ids UUID[] DEFAULT '{}',
  contract_expiry DATE,
  performance_rating NUMERIC(3,1) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  role VARCHAR(50),
  shift_date DATE NOT NULL,
  start_time VARCHAR(20),
  end_time VARCHAR(20),
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Phase 4 — Commercial
CREATE TABLE IF NOT EXISTS lease_pipeline_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  prospect_name VARCHAR(255),
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  shop_label VARCHAR(100),
  proposed_rent NUMERIC(12,2) DEFAULT 0,
  stage VARCHAR(50) DEFAULT 'Enquiry',
  probability INT DEFAULT 10,
  expected_close DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deposit_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  direction VARCHAR(50) NOT NULL,
  reason TEXT,
  entry_date DATE DEFAULT CURRENT_DATE,
  balance_after NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rent_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  method VARCHAR(50),
  reference VARCHAR(100),
  period VARCHAR(7),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Phase 5 — Intelligence / permissions
CREATE TABLE IF NOT EXISTS permission_overrides (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  permissions TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Phase 6 — Branding / webhooks
CREATE TABLE IF NOT EXISTS org_branding (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  primary_color VARCHAR(20),
  accent_color VARCHAR(20),
  logo_url TEXT,
  support_email VARCHAR(255),
  custom_domain_hint VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  secret VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE SET NULL,
  url TEXT,
  event VARCHAR(100),
  payload JSONB,
  status VARCHAR(50),
  attempts INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Phase 7 — Elevate
CREATE TABLE IF NOT EXISTS ticket_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  kind VARCHAR(20) DEFAULT 'evidence',
  storage_path TEXT,
  caption TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notify_outbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel VARCHAR(20) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject TEXT,
  body TEXT,
  priority VARCHAR(50),
  status VARCHAR(50) DEFAULT 'queued',
  related_ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  shop_number VARCHAR(50),
  business_name VARCHAR(255),
  period VARCHAR(7),
  line_items JSONB DEFAULT '[]',
  total NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft',
  issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lease_renewals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
  tenant_name VARCHAR(255),
  shop_number VARCHAR(50),
  current_end DATE,
  proposed_end DATE,
  escalation_pct NUMERIC(5,2) DEFAULT 0,
  current_rent NUMERIC(12,2),
  proposed_rent NUMERIC(12,2),
  status VARCHAR(50) DEFAULT 'upcoming',
  reminder_days INT[] DEFAULT '{90,60,30}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cam_charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period VARCHAR(7),
  description TEXT,
  total_pool NUMERIC(12,2),
  allocations JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS field_job_states (
  ticket_id UUID PRIMARY KEY REFERENCES tickets(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  parts_used TEXT,
  time_minutes INT,
  signature_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  serial VARCHAR(100),
  location VARCHAR(255),
  warranty_end DATE,
  next_service DATE,
  status VARCHAR(50) DEFAULT 'Operational',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS handover_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shift_label VARCHAR(100),
  author_name VARCHAR(255),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS csat_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  score INT CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS popia_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subject_name VARCHAR(255),
  subject_email VARCHAR(255),
  request_type VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'received',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ
);

-- Enable RLS on new tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'sla_matrices','preventive_tasks','vendors','staff_shifts',
    'lease_pipeline_deals','deposit_ledger','rent_payments',
    'permission_overrides','org_branding','webhook_endpoints','webhook_deliveries',
    'ticket_photos','notify_outbox','invoices','lease_renewals','cam_charges',
    'field_job_states','assets','handover_notes','csat_entries','popia_requests'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- Helper: same-org policy pattern (requires existing app_user_org_ids() from core schema)
-- If helper is missing, create a simple version:
CREATE OR REPLACE FUNCTION public.app_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM users WHERE email = auth.jwt() ->> 'email'
  UNION
  SELECT NULL WHERE EXISTS (
    SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role = 'super_admin'
  );
$$;

-- Org-scoped SELECT policies (repeat pattern for write as needed before go-live)
CREATE POLICY p37_sla_select ON sla_matrices FOR SELECT USING (
  organization_id IN (SELECT public.app_user_org_ids()) OR EXISTS (
    SELECT 1 FROM users u WHERE u.email = auth.jwt()->>'email' AND u.role = 'super_admin'
  )
);
CREATE POLICY p37_prev_select ON preventive_tasks FOR SELECT USING (
  organization_id IN (SELECT public.app_user_org_ids()) OR EXISTS (
    SELECT 1 FROM users u WHERE u.email = auth.jwt()->>'email' AND u.role = 'super_admin'
  )
);
CREATE POLICY p37_pipeline_select ON lease_pipeline_deals FOR SELECT USING (
  organization_id IN (SELECT public.app_user_org_ids()) OR EXISTS (
    SELECT 1 FROM users u WHERE u.email = auth.jwt()->>'email' AND u.role = 'super_admin'
  )
);
CREATE POLICY p37_pay_select ON rent_payments FOR SELECT USING (
  organization_id IN (SELECT public.app_user_org_ids()) OR EXISTS (
    SELECT 1 FROM users u WHERE u.email = auth.jwt()->>'email' AND u.role = 'super_admin'
  )
);
CREATE POLICY p37_inv_select ON invoices FOR SELECT USING (
  organization_id IN (SELECT public.app_user_org_ids()) OR EXISTS (
    SELECT 1 FROM users u WHERE u.email = auth.jwt()->>'email' AND u.role = 'super_admin'
  )
);
CREATE POLICY p37_popia_select ON popia_requests FOR SELECT USING (
  organization_id IN (SELECT public.app_user_org_ids()) OR EXISTS (
    SELECT 1 FROM users u WHERE u.email = auth.jwt()->>'email' AND u.role = 'super_admin'
  )
);

COMMENT ON TABLE lease_pipeline_deals IS 'Phase 4 leasing pipeline';
COMMENT ON TABLE rent_payments IS 'Phase 7 payment rails (MoMo/EFT references)';
COMMENT ON TABLE popia_requests IS 'Phase 7 POPIA subject requests — process per legal policy';

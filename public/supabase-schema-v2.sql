-- ============================================================================
-- UMHLABA WAMI — Schema v2 (evolved product model)
-- Run on a FRESH Supabase project, or after dropping old public tables.
-- Then: supabase-auth-bridge.sql, seed-super-admin-only.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organisations (landlords / property companies)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_code VARCHAR(30) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'Starter',
  status VARCHAR(50) NOT NULL DEFAULT 'Pending Approval',
  property_limit INT NOT NULL DEFAULT 3,
  tenant_limit INT NOT NULL DEFAULT 100,
  user_limit INT NOT NULL DEFAULT 10,
  storage_limit INT NOT NULL DEFAULT 10,
  monthly_fee_estimate NUMERIC(12, 2),
  logo_url TEXT,
  branding_primary VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by VARCHAR(255)
);

-- App users (linked to Auth by email)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL,
  property_id UUID,
  shopping_center_id UUID,
  shop_id UUID,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, username)
);

CREATE TABLE shopping_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  operating_hours VARCHAR(255),
  parking_bays INT DEFAULT 0,
  amenities TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shopping_center_id UUID REFERENCES shopping_centers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL DEFAULT 'Retail',
  address TEXT NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  shopping_center_id UUID REFERENCES shopping_centers(id) ON DELETE CASCADE,
  shop_number VARCHAR(50) NOT NULL,
  floor VARCHAR(100) DEFAULT 'Ground',
  size_sqm NUMERIC(10, 2) DEFAULT 0,
  monthly_rent NUMERIC(12, 2) DEFAULT 0,
  deposit_amount NUMERIC(12, 2) DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Available',
  public_listing BOOLEAN NOT NULL DEFAULT false,
  public_featured BOOLEAN NOT NULL DEFAULT false,
  qr_code VARCHAR(100),
  images TEXT[],
  features TEXT[],
  description TEXT,
  power_specs VARCHAR(255),
  parking_allocated INT DEFAULT 0,
  available_from VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  shopping_center_id UUID REFERENCES shopping_centers(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  business_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  trade_type VARCHAR(100),
  move_in_date DATE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rental_amount NUMERIC(12, 2) NOT NULL,
  deposit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  renewal_status VARCHAR(50) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(100) UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shopping_center_id UUID REFERENCES shopping_centers(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  shop_id UUID NOT NULL REFERENCES shops(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  exact_location_description TEXT,
  priority VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Open',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  response_deadline TIMESTAMPTZ NOT NULL,
  resolution_deadline TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  sla_status VARCHAR(50) NOT NULL DEFAULT 'Compliant',
  repair_notes TEXT,
  materials_used TEXT,
  time_spent_hours NUMERIC(6, 2),
  cost NUMERIC(12, 2),
  before_images TEXT[],
  after_images TEXT[],
  tenant_rating INT,
  tenant_feedback TEXT,
  tenant_confirmed_fixed BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  actor_name VARCHAR(255) NOT NULL,
  actor_role VARCHAR(100),
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id),
  shop_id UUID REFERENCES shops(id),
  tenant_id UUID REFERENCES tenants(id),
  ticket_id UUID REFERENCES tickets(id),
  type VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'SZL',
  reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace / sales leads from "List property"
CREATE TABLE listing_leads (
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

-- Auth helpers for RLS
CREATE OR REPLACE FUNCTION public.current_app_user()
RETURNS users LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organization_id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1;
$$;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_leads ENABLE ROW LEVEL SECURITY;

-- Public registration (anyone can apply)
CREATE POLICY org_insert_register ON organizations FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'Pending Approval');

CREATE POLICY org_select ON organizations FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin' OR id = public.current_user_org_id());

CREATE POLICY org_update_super ON organizations FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'super_admin');

CREATE POLICY users_select ON users FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'super_admin'
    OR organization_id = public.current_user_org_id()
    OR email = auth.jwt() ->> 'email'
  );

CREATE POLICY users_insert_admin ON users FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() IN ('super_admin', 'admin')
    OR public.current_user_role() = 'super_admin'
  );

CREATE POLICY users_update_admin ON users FOR UPDATE TO authenticated
  USING (
    public.current_user_role() IN ('super_admin', 'admin')
    OR email = auth.jwt() ->> 'email'
  );

CREATE POLICY shops_public ON shops FOR SELECT TO anon, authenticated
  USING (public_listing = true OR public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY shops_write ON shops FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY sc_org ON shopping_centers FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY prop_org ON properties FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY tenants_org ON tenants FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY leases_org ON leases FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY tickets_org ON tickets FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY timeline_org ON ticket_timeline FOR ALL TO authenticated
  USING (true);

CREATE POLICY finance_org ON finance_transactions FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY activity_select ON activity_logs FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY activity_insert ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Anyone can submit a listing lead; only super admin reads
CREATE POLICY leads_insert ON listing_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY leads_select ON listing_leads FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin');

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

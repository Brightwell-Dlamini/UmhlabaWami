-- ============================================================================
-- UMHLABA WAMI — Phase 2 Production Schema + Comprehensive RLS
-- Run this in the Supabase SQL Editor after creating a new project.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    custom_branding_color VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMPTZ,
    approved_by VARCHAR(255)
);

-- App profile linked to auth.users via email (id may match auth.uid when provisioned that way)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    property_id UUID,
    shopping_center_id UUID,
    shop_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, username),
    UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS shopping_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    shopping_center_id UUID REFERENCES shopping_centers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    shopping_center_id UUID REFERENCES shopping_centers(id) ON DELETE CASCADE,
    shop_number VARCHAR(50) NOT NULL,
    floor VARCHAR(100) NOT NULL,
    size_sqm NUMERIC(10, 2) NOT NULL,
    rental_amount NUMERIC(12, 2) NOT NULL,
    deposit_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    public_listing BOOLEAN NOT NULL DEFAULT true,
    public_featured BOOLEAN NOT NULL DEFAULT false,
    qr_code VARCHAR(100) NOT NULL,
    images TEXT[],
    features TEXT[],
    description TEXT,
    power_specs VARCHAR(255),
    parking_allocated INT DEFAULT 0,
    available_from VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    shopping_center_id UUID REFERENCES shopping_centers(id) ON DELETE SET NULL,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    trade_type VARCHAR(100),
    move_in_date DATE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    uploaded_by VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rental_amount NUMERIC(12, 2) NOT NULL,
    deposit NUMERIC(12, 2) NOT NULL,
    renewal_status VARCHAR(50) NOT NULL DEFAULT 'Active',
    document_url TEXT,
    document_title VARCHAR(255),
    is_digitally_signed BOOLEAN DEFAULT false,
    signed_at TIMESTAMPTZ,
    signer_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sla_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    emergency_response_mins INT NOT NULL DEFAULT 15,
    high_response_mins INT NOT NULL DEFAULT 60,
    medium_response_mins INT NOT NULL DEFAULT 240,
    low_response_mins INT NOT NULL DEFAULT 1440,
    expiry_date DATE NOT NULL,
    signed_at TIMESTAMPTZ,
    signer_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(100),
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Paid',
    reconciled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'General',
    target_audience VARCHAR(100) NOT NULL DEFAULT 'All Tenants',
    created_by_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- HELPER: current app user row for RLS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_app_user()
RETURNS users
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Organizations
CREATE POLICY org_select_member ON organizations FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'super_admin'
    OR id = public.current_user_org_id()
  );

CREATE POLICY org_insert_anon_register ON organizations FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'Pending Approval');

CREATE POLICY org_update_super ON organizations FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'super_admin');

-- Users
CREATE POLICY users_select ON users FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'super_admin'
    OR organization_id = public.current_user_org_id()
    OR email = auth.jwt() ->> 'email'
  );

CREATE POLICY users_update_self_or_admin ON users FOR UPDATE TO authenticated
  USING (
    email = auth.jwt() ->> 'email'
    OR public.current_user_role() IN ('admin', 'super_admin')
  );

-- Shops: public marketplace + org members
CREATE POLICY shops_public_select ON shops FOR SELECT TO anon, authenticated
  USING (public_listing = true AND status = 'Available');

CREATE POLICY shops_org_select ON shops FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'super_admin'
    OR organization_id = public.current_user_org_id()
  );

CREATE POLICY shops_org_write ON shops FOR ALL TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'property_manager', 'super_admin')
    AND (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id())
  )
  WITH CHECK (
    public.current_user_role() IN ('admin', 'property_manager', 'super_admin')
    AND (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id())
  );

-- Shopping centers / properties / tenants — org scoped
CREATE POLICY sc_org ON shopping_centers FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id())
  WITH CHECK (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY prop_org ON properties FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id())
  WITH CHECK (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY tenants_org ON tenants FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id())
  WITH CHECK (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

-- Tickets
CREATE POLICY tickets_select ON tickets FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'super_admin'
    OR organization_id = public.current_user_org_id()
  );

CREATE POLICY tickets_insert ON tickets FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.current_user_org_id()
    OR public.current_user_role() = 'super_admin'
  );

CREATE POLICY tickets_update ON tickets FOR UPDATE TO authenticated
  USING (
    public.current_user_role() = 'super_admin'
    OR organization_id = public.current_user_org_id()
  );

-- Ticket children follow ticket org via join-friendly policies
CREATE POLICY timeline_org ON ticket_timeline FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
        AND (public.current_user_role() = 'super_admin' OR t.organization_id = public.current_user_org_id())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
        AND (public.current_user_role() = 'super_admin' OR t.organization_id = public.current_user_org_id())
    )
  );

CREATE POLICY comments_org ON ticket_comments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
        AND (public.current_user_role() = 'super_admin' OR t.organization_id = public.current_user_org_id())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
        AND (public.current_user_role() = 'super_admin' OR t.organization_id = public.current_user_org_id())
    )
  );

CREATE POLICY attachments_org ON attachments FOR ALL TO authenticated
  USING (
    ticket_id IS NULL OR EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
        AND (public.current_user_role() = 'super_admin' OR t.organization_id = public.current_user_org_id())
    )
  )
  WITH CHECK (true);

CREATE POLICY leases_org ON leases FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id())
  WITH CHECK (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY sla_org ON sla_agreements FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id())
  WITH CHECK (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY finance_org ON finance_transactions FOR ALL TO authenticated
  USING (
    public.current_user_role() = 'super_admin'
    OR (
      organization_id = public.current_user_org_id()
      AND public.current_user_role() IN ('finance', 'admin', 'property_manager', 'super_admin')
    )
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    OR organization_id = public.current_user_org_id()
  );

CREATE POLICY announcements_org ON announcements FOR ALL TO authenticated
  USING (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id())
  WITH CHECK (public.current_user_role() = 'super_admin' OR organization_id = public.current_user_org_id());

CREATE POLICY activity_org ON activity_logs FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'super_admin'
    OR organization_id = public.current_user_org_id()
  );

CREATE POLICY activity_insert ON activity_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- STORAGE BUCKETS (run in dashboard or via storage API)
-- Create buckets: ticket-attachments, property-images, lease-documents, org-logos
-- ---------------------------------------------------------------------------
-- Example storage policies should restrict by folder prefix org_id/...

COMMENT ON TABLE organizations IS 'Multi-tenant landlords / property groups';
COMMENT ON TABLE tickets IS 'SLA-tracked maintenance and support tickets';

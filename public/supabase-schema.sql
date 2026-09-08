-- ============================================================================
-- UMHLABA WAMI — COMMERCIAL PROPERTY MANAGEMENT & LISTING PLATFORM
-- Production Supabase PostgreSQL Schema & Row-Level Security (RLS) Policies
-- Generated for Shopping Centers & Commercial Portfolios in Eswatini
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_code VARCHAR(30) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'Starter', -- Starter, Professional, Enterprise
    status VARCHAR(50) NOT NULL DEFAULT 'Pending Approval', -- Pending Approval, Active, Suspended, Rejected
    property_limit INT NOT NULL DEFAULT 3,
    tenant_limit INT NOT NULL DEFAULT 100,
    user_limit INT NOT NULL DEFAULT 10,
    storage_limit INT NOT NULL DEFAULT 10, -- In GB
    monthly_fee_estimate NUMERIC(12, 2),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(255)
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL, -- tenant, property_manager, maintenance, finance, admin, super_admin
    property_id UUID,
    shopping_center_id UUID,
    shop_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SHOPPING CENTERS TABLE
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    shopping_center_id UUID REFERENCES shopping_centers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- Retail shop, Office, Warehouse, Restaurant, Kiosk, Commercial unit, Mixed-use
    address TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SHOPS / COMMERCIAL UNITS TABLE
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
    status VARCHAR(50) NOT NULL DEFAULT 'Available', -- Available, Occupied, Reserved, Under Maintenance
    public_listing BOOLEAN NOT NULL DEFAULT true,
    public_featured BOOLEAN NOT NULL DEFAULT false,
    qr_code VARCHAR(100) NOT NULL,
    images TEXT[],
    features TEXT[],
    description TEXT,
    power_specs VARCHAR(255),
    parking_allocated INT DEFAULT 0,
    available_from VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TENANTS TABLE
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TICKETS TABLE
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
    priority VARCHAR(50) NOT NULL, -- Low, Medium, High, Emergency
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open', -- Open, In Progress, Awaiting Approval, Resolved, Closed, Reopened, Cancelled
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    response_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    resolution_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TICKET TIMELINE & COMMENTS
CREATE TABLE IF NOT EXISTS ticket_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    uploaded_by VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. LEASES TABLE
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
    signed_at TIMESTAMP WITH TIME ZONE,
    signer_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. SLA AGREEMENTS TABLE
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
    signed_at TIMESTAMP WITH TIME ZONE,
    signer_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. FINANCE TRANSACTIONS & EXPENSES
CREATE TABLE IF NOT EXISTS finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    direction VARCHAR(20) NOT NULL, -- income, expense
    description TEXT NOT NULL,
    reference VARCHAR(100),
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Paid',
    reconciled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. ANNOUNCEMENTS & EMERGENCY BROADCASTS
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;

-- Public can view active vacant shops
CREATE POLICY "Public can view available shops"
    ON shops FOR SELECT
    USING (public_listing = true AND status = 'Available');

-- Tenants can only see their own tickets
CREATE POLICY "Tenants view own tickets"
    ON tickets FOR SELECT
    TO authenticated
    USING (created_by_user_id = auth.uid() OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('property_manager', 'admin', 'maintenance', 'super_admin')
    ));

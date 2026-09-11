-- Portfolio + ops tables columns the app expects
-- Safe to re-run

-- Shops / units
ALTER TABLE shops ADD COLUMN IF NOT EXISTS property_type TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS floor TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS size_sqm NUMERIC;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS rental_amount NUMERIC;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS public_listing BOOLEAN DEFAULT false;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS public_featured BOOLEAN DEFAULT false;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS qr_code TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS power_specs TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS parking_allocated INT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS available_from DATE;

-- Shopping centers
ALTER TABLE shopping_centers ADD COLUMN IF NOT EXISTS operating_hours TEXT;
ALTER TABLE shopping_centers ADD COLUMN IF NOT EXISTS parking_bays INT DEFAULT 0;
ALTER TABLE shopping_centers ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';
ALTER TABLE shopping_centers ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE shopping_centers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE shopping_centers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- Properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS address TEXT;

-- Organizations branding
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS custom_branding_color TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'General',
  target_audience TEXT DEFAULT 'All Tenants',
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS announcements_all ON announcements;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY announcements_all ON announcements
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON announcements TO authenticated;
GRANT SELECT ON announcements TO anon;

-- Tenants extras
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trade_type TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS shopping_center_id UUID;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS shop_id UUID;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contact_person TEXT;

-- Tickets: allow null tenant for internal/admin logged issues
DO $$ BEGIN
  ALTER TABLE tickets ALTER COLUMN tenant_id DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE tickets ALTER COLUMN property_id DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE tickets ALTER COLUMN shop_id DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

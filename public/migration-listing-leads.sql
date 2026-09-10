-- Run on existing Supabase projects (safe)
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

DROP POLICY IF EXISTS leads_insert ON listing_leads;
CREATE POLICY leads_insert ON listing_leads FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS leads_select ON listing_leads;
CREATE POLICY leads_select ON listing_leads FOR SELECT TO authenticated
  USING (public.current_user_role() = 'super_admin');

-- Organisation self-registration (anon + signed-in)
DROP POLICY IF EXISTS org_insert_anon_register ON organizations;
DROP POLICY IF EXISTS org_insert_register ON organizations;
CREATE POLICY org_insert_register ON organizations FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'Pending Approval');

-- ============================================================================
-- UMHLABA WAMI — Minimal production seed: Super Admin only
-- Run AFTER: supabase-schema.sql, supabase-schema-phase3-7.sql, supabase-auth-bridge.sql
-- Do NOT run the full seed-demo-data.sql if you want an empty commercial world.
--
-- Then create ONE Auth user in Dashboard → Authentication → Users:
--   Email:    admin@umhlabawami.sz
--   Password: (choose a strong password — you will use it at login)
--   Auto-confirm: yes
--
-- Login: Organisation code SUPER · Username superadmin · your password
-- ============================================================================

BEGIN;

-- Clear demo commercial data if re-running (safe for empty projects)
DELETE FROM tickets;
DELETE FROM leases;
DELETE FROM tenants;
DELETE FROM shops;
DELETE FROM properties;
DELETE FROM shopping_centers;
DELETE FROM users WHERE role <> 'super_admin';
DELETE FROM organizations WHERE organization_code IS DISTINCT FROM 'SUPER';

-- Platform holder (optional; super_admin may have null organization_id)
INSERT INTO organizations (
  id, organization_code, company_name, owner_name, email, phone, address,
  subscription_tier, status, property_limit, tenant_limit, user_limit, storage_limit,
  created_at, approved_at, approved_by
) VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'SUPER',
  'Umhlaba Wami Platform',
  'Platform Administrator',
  'admin@umhlabawami.sz',
  '+268 2400 0000',
  'Mbabane, Eswatini',
  'Enterprise',
  'Active',
  999, 9999, 999, 500,
  NOW(), NOW(), 'System'
)
ON CONFLICT (organization_code) DO UPDATE SET
  status = 'Active',
  company_name = EXCLUDED.company_name;

INSERT INTO users (
  id, organization_id, username, name, email, phone, role, status, created_at
) VALUES (
  'a0000000-0000-4000-8000-000000000002',
  NULL,
  'superadmin',
  'Platform Super Admin',
  'admin@umhlabawami.sz',
  '+268 2400 0000',
  'super_admin',
  'Active',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  username = 'superadmin',
  role = 'super_admin',
  status = 'Active',
  name = EXCLUDED.name;

COMMIT;

-- Verify:
-- SELECT username, email, role FROM users WHERE role = 'super_admin';

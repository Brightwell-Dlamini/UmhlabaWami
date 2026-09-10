-- Editable subscription plan catalog for Super Admin
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  property_limit INT NOT NULL DEFAULT 3,
  tenant_limit INT NOT NULL DEFAULT 100,
  user_limit INT NOT NULL DEFAULT 10,
  storage_limit_gb INT NOT NULL DEFAULT 10,
  price_per_month NUMERIC(12, 2) NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS plans_select ON subscription_plans;
  DROP POLICY IF EXISTS plans_write ON subscription_plans;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY plans_select ON subscription_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY plans_write ON subscription_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON subscription_plans TO anon, authenticated;

-- Seed defaults if empty
INSERT INTO subscription_plans (tier_key, name, property_limit, tenant_limit, user_limit, storage_limit_gb, price_per_month, features, sort_order)
SELECT * FROM (VALUES
  ('Starter', 'Starter Center Package', 3, 100, 10, 10, 1450::numeric, ARRAY['Up to 3 Properties','100 Active Tenants','Basic SLA Tracking','Ticket Management','Email Support'], 1),
  ('Professional', 'Professional Portfolio', 10, 500, 30, 50, 3850::numeric, ARRAY['Up to 10 Properties','500 Active Tenants','Auto SLA Escalations','Staff Rostering','Finance Export','Priority Support'], 2),
  ('Enterprise', 'Enterprise Commercial Group', 999, 9999, 999, 500, 8900::numeric, ARRAY['Unlimited Properties & Tenants','Custom SLA Rules','Vendor Management','Emergency Broadcast','Dedicated Account Manager'], 3)
) AS v(tier_key, name, property_limit, tenant_limit, user_limit, storage_limit_gb, price_per_month, features, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans LIMIT 1);

-- Allow org.subscription_tier to hold custom keys (already VARCHAR)

-- Allow anon to read publicly listed units and related property/centre rows for the marketplace.
-- Run after core schema.

CREATE POLICY IF NOT EXISTS shops_public_select ON shops
  FOR SELECT TO anon, authenticated
  USING (public_listing = true);

-- properties linked to a public listing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'prop_public_via_listing' AND tablename = 'properties'
  ) THEN
    CREATE POLICY prop_public_via_listing ON properties
      FOR SELECT TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1 FROM shops s
          WHERE s.property_id = properties.id AND s.public_listing = true
        )
        OR public.current_user_role() = 'super_admin'
        OR organization_id = public.current_user_org_id()
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'sc_public_via_listing' AND tablename = 'shopping_centers'
  ) THEN
    CREATE POLICY sc_public_via_listing ON shopping_centers
      FOR SELECT TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1 FROM shops s
          WHERE s.shopping_center_id = shopping_centers.id AND s.public_listing = true
        )
        OR public.current_user_role() = 'super_admin'
        OR organization_id = public.current_user_org_id()
      );
  END IF;
END $$;

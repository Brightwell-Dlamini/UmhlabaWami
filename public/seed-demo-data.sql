-- ============================================================================
-- UMHLABA WAMI — Demo seed data for Supabase
-- Run AFTER: public/supabase-schema.sql
-- Optional after: public/supabase-schema-phase3-7.sql
-- IDs = uuid_v5(DNS, 'umhlabawami.seed.' || legacy_id)
-- Create Auth users matching each users.email with a known password.
-- ============================================================================

BEGIN;

DELETE FROM tickets WHERE organization_id IN (
  SELECT id FROM organizations WHERE organization_code IN ('SWZ-060926','GAB-070826','RIV-010926')
);
DELETE FROM leases WHERE organization_id IN (
  SELECT id FROM organizations WHERE organization_code IN ('SWZ-060926','GAB-070826','RIV-010926')
);
DELETE FROM tenants WHERE organization_id IN (
  SELECT id FROM organizations WHERE organization_code IN ('SWZ-060926','GAB-070826','RIV-010926')
);
DELETE FROM shops WHERE organization_id IN (
  SELECT id FROM organizations WHERE organization_code IN ('SWZ-060926','GAB-070826','RIV-010926')
);
DELETE FROM properties WHERE organization_id IN (
  SELECT id FROM organizations WHERE organization_code IN ('SWZ-060926','GAB-070826','RIV-010926')
);
DELETE FROM shopping_centers WHERE organization_id IN (
  SELECT id FROM organizations WHERE organization_code IN ('SWZ-060926','GAB-070826','RIV-010926')
);
DELETE FROM users WHERE email IN (
  'admin@umhlabawami.sz','lindiwe@ezulwiniproperties.sz','sipho@ezulwiniproperties.sz',
  'nandi@swaziartisancrafts.sz','bheki@ezulwiniproperties.sz','thandeka@ezulwiniproperties.sz'
);
DELETE FROM organizations WHERE organization_code IN ('SWZ-060926','GAB-070826','RIV-010926');

INSERT INTO organizations (id, organization_code, company_name, owner_name, email, phone, address, subscription_tier, status, property_limit, tenant_limit, user_limit, storage_limit, monthly_fee_estimate, created_at, approved_at, approved_by, logo_url) VALUES
  ('aefbfc34-cbeb-5069-90eb-6bfcc830196b', 'SWZ-060926', 'Swazi Plaza Properties Ltd', 'Mandla Simelane', 'info@swaziplaza.co.sz', '+268 2404 1234', 'Plaza Complex, Mbabane, Eswatini', 'Enterprise', 'Active', 25, 800, 50, 200, 8900, '2026-08-15T08:00:00Z', '2026-08-16T10:00:00Z', 'Super Admin', 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=200&q=80'),
  ('827b83a3-7c6c-5392-9d1d-923f1c2fbf42', 'GAB-070826', 'Ezulwini Commercial Holdings', 'Lindiwe Dlamini', 'management@ezulwiniproperties.sz', '+268 2416 9900', 'Corner Main Road & Gables Way, Ezulwini Valley', 'Professional', 'Active', 10, 500, 30, 50, 3850, '2026-08-20T09:30:00Z', '2026-08-21T11:00:00Z', 'Super Admin', NULL),
  ('cc2fe264-d13b-5e7e-85c4-7f636108dd45', 'RIV-010926', 'Manzini Riverstone Investments', 'Khulekani Ginindza', 'admin@riverstoneholdings.sz', '+268 2505 4411', 'Corner Ngwane & Tenbergen St, Manzini', 'Professional', 'Pending Approval', 5, 250, 20, 30, 3100, '2026-09-05T14:15:00Z', NULL, NULL, NULL);

INSERT INTO shopping_centers (id, organization_id, name, address, location, description, image, status, operating_hours, parking_bays, amenities) VALUES
  ('f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', 'The Gables Shopping Centre', 'Old MR3 Highway, Ezulwini Valley', 'Ezulwini Valley', 'Premier lifestyle and retail centre', 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80', 'Active', 'Mon - Sat: 08:30 - 18:00 | Sun: 09:00 - 15:00', 480, ARRAY['24/7 Armed Security','Backup Generators','Fiber Internet']::text[]),
  ('b5863583-7aab-5a73-8747-c2924dc8ed58', 'aefbfc34-cbeb-5069-90eb-6bfcc830196b', 'Swazi Plaza & Corporate Place', 'Plaza Complex, Dzeliwe Street, Mbabane', 'Mbabane Central', 'Capital CBD shopping and office hub', 'https://images.unsplash.com/photo-1567449303078-57ad995bd301?auto=format&fit=crop&w=1200&q=80', 'Active', 'Mon - Fri: 08:00 - 17:30 | Sat: 08:30 - 14:00', 650, ARRAY['Underground Secure Parking','CCTV Surveillance']::text[]),
  ('95348aad-9053-5158-a945-78c0fd1507b1', 'aefbfc34-cbeb-5069-90eb-6bfcc830196b', 'Riverstone Mall', 'Corner Ngwane & Tenbergen Street, Manzini', 'Manzini City', 'Commercial heart of Manzini', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80', 'Active', 'Mon - Sat: 08:30 - 18:30 | Sun: 09:00 - 16:00', 520, ARRAY['Automated Parking Boom','Loading Docks']::text[]),
  ('82154302-ab23-5cbc-a30c-9b236e10e383', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', 'Matsapha Commercial & Logistics Park', 'Industrial Road 4, Matsapha', 'Matsapha Industrial', 'Warehouse and logistics park', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80', 'Active', '24/7 Gated Industrial Access', 180, ARRAY['Heavy Vehicle Turning Circles','3-Phase Supply']::text[]);

INSERT INTO properties (id, organization_id, shopping_center_id, name, type, address, description, status) VALUES
  ('737a4f6e-ef1e-5d55-8fbb-60f934d01af7', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', 'The Gables Main Retail Arcade', 'Retail shop', 'Ground & 1st Floor Arcade, The Gables, Ezulwini', 'High-visibility retail boutique spaces', 'Active'),
  ('204df5c1-1c86-5d22-9fbc-0ec329690738', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', 'The Gables Corporate Suites', 'Office', 'Level 2, Corporate Wing, Ezulwini', 'Modern executive offices', 'Active'),
  ('5dd0bfd1-e517-5b95-991f-4c1887eaec7c', 'aefbfc34-cbeb-5069-90eb-6bfcc830196b', 'b5863583-7aab-5a73-8747-c2924dc8ed58', 'Swazi Plaza High-Street Retail', 'Retail shop', 'Central Walkway, Swazi Plaza, Mbabane', 'High footfall CBD retail', 'Active'),
  ('8197d515-c960-59ac-a7e6-4df388f3f47e', 'aefbfc34-cbeb-5069-90eb-6bfcc830196b', '95348aad-9053-5158-a945-78c0fd1507b1', 'Riverstone Food & Lifestyle Gallery', 'Restaurant', 'Food Terrace, Riverstone Mall, Manzini', 'Restaurant premises', 'Active'),
  ('2fe1506d-c831-51a9-8f81-6057fde8ef06', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', '82154302-ab23-5cbc-a30c-9b236e10e383', 'Matsapha Distribution Units', 'Warehouse', 'Unit Bay 1-8, Matsapha Industrial', 'High-cube warehouse bays', 'Active');

INSERT INTO users (id, organization_id, username, name, email, phone, role, shopping_center_id, property_id, shop_id, status, avatar_url, created_at) VALUES
  ('9aa3417a-9be0-590e-9558-e9026890f1db', NULL, 'superadmin', 'Phumzile Nhlabatsi', 'admin@umhlabawami.sz', '+268 7602 1100', 'super_admin', NULL, NULL, NULL, 'Active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', '2026-01-01T00:00:00Z'),
  ('a4f63ed7-dc9b-52f4-913d-2b496bee2828', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', 'lindiwe.admin', 'Lindiwe Dlamini (Admin)', 'lindiwe@ezulwiniproperties.sz', '+268 7604 5588', 'admin', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', NULL, NULL, 'Active', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', '2026-08-20T10:00:00Z'),
  ('b8a9711b-073d-5766-b606-d99e2763218c', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', 'sipho.manager', 'Sipho Dlamini (Property Manager)', 'sipho@ezulwiniproperties.sz', '+268 7611 2233', 'property_manager', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', '737a4f6e-ef1e-5d55-8fbb-60f934d01af7', NULL, 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', '2026-08-21T09:00:00Z'),
  ('fc08cd90-49d8-590f-8524-ef595fda0d73', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', 'bheki.maintenance', 'Bheki Maseko (Senior Facilities Tech)', 'bheki@ezulwiniproperties.sz', '+268 7633 4455', 'maintenance', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', '737a4f6e-ef1e-5d55-8fbb-60f934d01af7', NULL, 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', '2026-08-21T09:30:00Z'),
  ('8fac55e0-6492-51b8-b2de-7db086f60661', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', 'thandeka.finance', 'Thandeka Nxumalo (Finance Lead)', 'thandeka@ezulwiniproperties.sz', '+268 7644 6677', 'finance', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', NULL, NULL, 'Active', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80', '2026-08-21T10:00:00Z'),
  ('49a7764d-58ea-5123-aefd-67ba5ca7ccf4', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', 'nandi.tenant', 'Nandi Khumalo (Swazi Artisan Crafts)', 'nandi@swaziartisancrafts.sz', '+268 7622 9988', 'tenant', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', '737a4f6e-ef1e-5d55-8fbb-60f934d01af7', NULL, 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', '2026-08-22T08:00:00Z');

INSERT INTO shops (id, organization_id, property_id, shopping_center_id, shop_number, floor, size_sqm, rental_amount, deposit_amount, status, public_listing, public_featured, qr_code, description, power_specs, parking_allocated, available_from, images, features) VALUES
  ('60d2a6c0-029d-55fb-b18c-a2513e64eac1', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', '737a4f6e-ef1e-5d55-8fbb-60f934d01af7', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', 'G-14', 'Ground Floor', 85, 17500, 35000, 'Occupied', false, false, 'UW-GABLES-G14', 'Prime retail unit next to central atrium', 'Single phase with backup generator', 2, NULL, ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80']::text[], ARRAY['Corner Double Display Glass','Air Conditioning']::text[]),
  ('4fb1d7eb-37f7-5963-b87d-9499b87680d7', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', '737a4f6e-ef1e-5d55-8fbb-60f934d01af7', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', 'G-18', 'Ground Floor', 110, 22000, 44000, 'Available', true, true, 'UW-GABLES-G18', 'Open-plan retail ready for fitout', '3-Phase 60A Supply', 3, 'Immediate', ARRAY['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80']::text[], ARRAY['High Footfall Piazza Frontage','Air Conditioning']::text[]),
  ('aa4c6a72-2e8d-54c8-84c3-ef62d1743901', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', '737a4f6e-ef1e-5d55-8fbb-60f934d01af7', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', 'G-05', 'Ground Courtyard', 165, 32000, 64000, 'Available', true, true, 'UW-GABLES-G05', 'Restaurant and cafe with outdoor patio', '3-Phase 100A', 5, '1st October 2026', ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80']::text[], ARRAY['Outdoor Veranda','Commercial Kitchen Gas']::text[]),
  ('79372054-5c96-5947-9e03-6743183f0705', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', '204df5c1-1c86-5d22-9fbc-0ec329690738', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', 'Ste-204', 'Level 2', 72, 13500, 27000, 'Available', true, false, 'UW-GABLES-204', 'Corporate suite with mountain views', 'UPS & Generator', 2, 'Immediate', ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80']::text[], ARRAY['Fiber Ready','Access Control']::text[]),
  ('47ac8372-154e-5cd0-a072-35f24fd581d3', 'aefbfc34-cbeb-5069-90eb-6bfcc830196b', '5dd0bfd1-e517-5b95-991f-4c1887eaec7c', 'b5863583-7aab-5a73-8747-c2924dc8ed58', 'K-02', 'Ground Concourse', 24, 7500, 15000, 'Available', true, true, 'UW-PLAZA-K02', 'Central concourse kiosk', 'Single phase sub-meter', 1, 'Immediate', ARRAY['https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80']::text[], ARRAY['Island Display','POS Ready']::text[]),
  ('f5356823-053b-5778-9d7c-46537eeed6f2', 'aefbfc34-cbeb-5069-90eb-6bfcc830196b', '5dd0bfd1-e517-5b95-991f-4c1887eaec7c', 'b5863583-7aab-5a73-8747-c2924dc8ed58', 'Shop 108', 'Level 1', 140, 28500, 57000, 'Reserved', false, false, 'UW-PLAZA-108', 'Spacious fashion retail', '3-Phase 80A', 3, NULL, ARRAY['https://images.unsplash.com/photo-1567449303078-57ad995bd301?auto=format&fit=crop&w=900&q=80']::text[], ARRAY['Double Display Window']::text[]);

UPDATE users SET shop_id = '60d2a6c0-029d-55fb-b18c-a2513e64eac1' WHERE id = '49a7764d-58ea-5123-aefd-67ba5ca7ccf4';

INSERT INTO tenants (id, organization_id, property_id, shopping_center_id, shop_id, business_name, contact_person, phone, email, status, trade_type, move_in_date, user_id) VALUES
  ('2c915f76-94fa-56ea-999d-aa386a91d49d', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', '737a4f6e-ef1e-5d55-8fbb-60f934d01af7', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', '60d2a6c0-029d-55fb-b18c-a2513e64eac1', 'Swazi Artisan Crafts', 'Nandi Khumalo', '+268 7622 9988', 'nandi@swaziartisancrafts.sz', 'Active', 'Handmade Crafts & Gifts', '2024-03-01', '49a7764d-58ea-5123-aefd-67ba5ca7ccf4');

INSERT INTO leases (id, tenant_id, shop_id, organization_id, start_date, end_date, rental_amount, deposit, renewal_status) VALUES
  ('89aa369c-82b8-5ddc-8a01-62b9d7e0f76f', '2c915f76-94fa-56ea-999d-aa386a91d49d', '60d2a6c0-029d-55fb-b18c-a2513e64eac1', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', '2024-03-01', '2027-02-28', 17500, 35000, 'Active');

INSERT INTO tickets (id, ticket_number, organization_id, shopping_center_id, property_id, shop_id, tenant_id, title, description, priority, category, status, assigned_to, created_by_user_id, response_deadline, resolution_deadline, sla_status) VALUES
  ('9785f90c-b1ed-5f07-bde9-897ef09ffdcb', 'GA-G14-060926-0001', '827b83a3-7c6c-5392-9d1d-923f1c2fbf42', 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c', '737a4f6e-ef1e-5d55-8fbb-60f934d01af7', '60d2a6c0-029d-55fb-b18c-a2513e64eac1', '2c915f76-94fa-56ea-999d-aa386a91d49d', 'AC unit not cooling', 'The wall unit in G-14 is blowing warm air during afternoon peak.', 'High', 'Air Conditioning', 'Open', 'fc08cd90-49d8-590f-8524-ef595fda0d73', '49a7764d-58ea-5123-aefd-67ba5ca7ccf4', NOW() + interval '4 hours', NOW() + interval '24 hours', 'Compliant');

COMMIT;

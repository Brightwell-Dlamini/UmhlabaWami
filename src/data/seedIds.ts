/** Deterministic UUID v5 seed ids (must match public/seed-demo-data.sql). */
export const SEED_IDS: Record<string, string> = {
  'org_swazi_plaza': 'aefbfc34-cbeb-5069-90eb-6bfcc830196b',
  'org_gables_lifestyle': '827b83a3-7c6c-5392-9d1d-923f1c2fbf42',
  'org_riverstone_group': 'cc2fe264-d13b-5e7e-85c4-7f636108dd45',
  'usr_superadmin': '9aa3417a-9be0-590e-9558-e9026890f1db',
  'usr_client_admin': 'a4f63ed7-dc9b-52f4-913d-2b496bee2828',
  'usr_property_manager': 'b8a9711b-073d-5766-b606-d99e2763218c',
  'usr_tenant_nandi': '49a7764d-58ea-5123-aefd-67ba5ca7ccf4',
  'usr_maintenance_bheki': 'fc08cd90-49d8-590f-8524-ef595fda0d73',
  'usr_finance_thandeka': '8fac55e0-6492-51b8-b2de-7db086f60661',
  'sc_gables': 'f0a7a3c2-1217-5738-9f7e-7c0860f27d7c',
  'sc_swazi_plaza': 'b5863583-7aab-5a73-8747-c2924dc8ed58',
  'sc_riverstone': '95348aad-9053-5158-a945-78c0fd1507b1',
  'sc_matsapha_park': '82154302-ab23-5cbc-a30c-9b236e10e383',
  'prop_gables_retail': '737a4f6e-ef1e-5d55-8fbb-60f934d01af7',
  'prop_gables_offices': 'c0ffee00-0000-5000-8000-000000000001',
  'prop_swazi_plaza_main': 'c0ffee00-0000-5000-8000-000000000002',
  'prop_riverstone_dining': 'c0ffee00-0000-5000-8000-000000000003',
  'prop_matsapha_warehouses': 'c0ffee00-0000-5000-8000-000000000004',
  'shop_g14': '60d2a6c0-029d-55fb-b18c-a2513e64eac1',
  'shop_g18': 'd1e2f3a4-b5c6-5789-8abc-def012345678',
  'shop_g05_rest': 'd1e2f3a4-b5c6-5789-8abc-def012345679',
  'shop_l2_off1': 'd1e2f3a4-b5c6-5789-8abc-def01234567a',
  'shop_sp_k02': 'd1e2f3a4-b5c6-5789-8abc-def01234567b',
  'shop_sp_108': 'd1e2f3a4-b5c6-5789-8abc-def01234567c',
  'ten_swazi_artisan': '2c915f76-94fa-56ea-999d-aa386a91d49d',
  'lease_swazi_artisan': '89aa369c-82b8-5ddc-8a01-62b9d7e0f76f',
  'ticket_demo_1': 't1c4e700-0000-5000-8000-000000000001',
};

export function seedId(legacy: string): string {
  return SEED_IDS[legacy] ?? legacy;
}

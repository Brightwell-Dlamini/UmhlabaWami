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
  'prop_gables_offices': '204df5c1-1c86-5d22-9fbc-0ec329690738',
  'prop_swazi_plaza_main': '5dd0bfd1-e517-5b95-991f-4c1887eaec7c',
  'prop_riverstone_dining': '8197d515-c960-59ac-a7e6-4df388f3f47e',
  'prop_matsapha_warehouses': '2fe1506d-c831-51a9-8f81-6057fde8ef06',
  'shop_g14': '60d2a6c0-029d-55fb-b18c-a2513e64eac1',
  'shop_g18': '4fb1d7eb-37f7-5963-b87d-9499b87680d7',
  'shop_g05_rest': 'aa4c6a72-2e8d-54c8-84c3-ef62d1743901',
  'shop_l2_off1': '79372054-5c96-5947-9e03-6743183f0705',
  'shop_sp_k02': '47ac8372-154e-5cd0-a072-35f24fd581d3',
  'shop_sp_108': 'f5356823-053b-5778-9d7c-46537eeed6f2',
  'ten_swazi_artisan': '2c915f76-94fa-56ea-999d-aa386a91d49d',
  'lease_swazi_artisan': '89aa369c-82b8-5ddc-8a01-62b9d7e0f76f',
  'ticket_demo_1': '9785f90c-b1ed-5f07-bde9-897ef09ffdcb',
};

export function seedId(legacy: string): string {
  return SEED_IDS[legacy] ?? legacy;
}

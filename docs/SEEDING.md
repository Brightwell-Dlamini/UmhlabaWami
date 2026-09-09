# Seeding Supabase from hardcoded demo data

## What was hardcoded

Almost all demo content lived in `src/services/db.ts` as `INITIAL_*` constants (orgs, users, centres, properties, shops, tenants, leases, tickets, finance, vendors, etc.) and was persisted to browser `localStorage`.

## What we shipped in the repo

1. **`public/seed-demo-data.sql`** — inserts the Eswatini demo **core** into Postgres (deterministic UUID v5 IDs).
2. **`src/data/seedIds.ts`** — same UUID map for code references.
3. **`hydrateAll()`** in `src/services/supabaseDb.ts` — loads organizations, users, centres, properties, shops, tenants, leases, tickets.
4. **`db.tryHydrateFromSupabase()`** — replaces in-memory collections when Supabase is configured.
5. **`App.tsx`** — calls hydrate on boot.

## Your steps (required for live data)

1. Run `public/supabase-schema.sql` in Supabase SQL Editor  
2. Optionally run `public/supabase-schema-phase3-7.sql`  
3. Run **`public/seed-demo-data.sql`**  
4. Create **Auth** users for each seed email with a known password  
5. Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` on Vercel  
6. Redeploy — app pulls core data from Supabase  

## Auth emails in seed

| Username | Email |
|----------|-------|
| superadmin | admin@umhlabawami.sz |
| lindiwe.admin | lindiwe@ezulwiniproperties.sz |
| sipho.manager | sipho@ezulwiniproperties.sz |
| nandi.tenant | nandi@swaziartisancrafts.sz |
| bheki.maintenance | bheki@ezulwiniproperties.sz |
| thandeka.finance | thandeka@ezulwiniproperties.sz |

## Still local-only until extended

Phase 3–7 client stores (pipeline, deposits, SLA matrices, Elevate, etc.) remain in local/dual-mode services until those tables are populated and hydrate is extended. Core marketplace + org/users/units/tickets path is the first production cutover.

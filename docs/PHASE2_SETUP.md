# Phase 2 Setup Guide — Supabase Backend

Phase 2 introduces a **dual-mode** architecture:

| Mode | When | Behaviour |
|------|------|-----------|
| **Demo** (default) | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` not set | localStorage data + demo login |
| **Supabase** | Both env vars set | Real Auth, PostgreSQL + RLS, Storage; app **hydrates** core tables on boot |

Live Vercel stays in **demo mode** until you add credentials. Owner checklist: [OWNER_SETUP.md](./OWNER_SETUP.md). Seeding detail: [SEEDING.md](./SEEDING.md).

---

## 1. Create a Supabase project

1. [supabase.com](https://supabase.com) — region closest to Eswatini / South Africa if available.  
2. **Project Settings → API** → copy URL + `anon` `public` key.

## 2. Apply schema + seed (three scripts)

1. SQL Editor → run **`public/supabase-schema.sql`** (core tables + base RLS).  
2. SQL Editor → run **`public/supabase-schema-phase3-7.sql`** (ops / commercial / Elevate tables).  
3. SQL Editor → run **`public/seed-demo-data.sql`** (Eswatini demo orgs, users, centres, units, sample ticket).

Confirm tables and rows under **Table Editor**.

## 3. Storage buckets

Create: `ticket-attachments`, `property-images`, `lease-documents`, `org-logos`.  
Scope policies by organisation folder prefix.

## 4. Auth users

Auth email must **exactly match** `public.users.email` (RLS helpers use JWT email).

Seed emails include: `admin@umhlabawami.sz`, `lindiwe@ezulwiniproperties.sz`, `sipho@ezulwiniproperties.sz`, `nandi@swaziartisancrafts.sz`, `bheki@ezulwiniproperties.sz`, `thandeka@ezulwiniproperties.sz`.

## 5. Environment variables

```bash
cp .env.example .env.local
# set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

Vercel → Environment Variables → same keys → Redeploy.

On boot, `db.tryHydrateFromSupabase()` loads organizations, users, centres, properties, shops, tenants, leases, tickets from Postgres into the SPA state.

## 6. Verify

Password login, marketplace listings from `shops`, org registration → approval, RLS isolation between orgs.

## 7. Rollback

Remove env vars or set `VITE_FORCE_DEMO_MODE=true` and redeploy.

---

## Architecture notes

- `src/lib/supabase.ts` — client + mode detection  
- `src/services/supabaseDb.ts` — `hydrateAll()` + remote helpers  
- `src/services/dbHydrate.ts` — attaches hydrate to `db`  
- `public/seed-demo-data.sql` — moves former hardcoded core seed into Postgres  

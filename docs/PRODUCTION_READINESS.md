# Production Readiness — Umhlaba Wami

**Updated:** September 2026  
**Target:** Real Supabase backend on Vercel (no localStorage mock product data)

---

## Verdict (honest)

| Layer | Status | Notes |
|-------|--------|--------|
| **Hosting (Vercel)** | Ready | SPA + env vars |
| **Auth (Supabase)** | Ready | Org code + username → Auth password via `resolve_login` |
| **Core data hydrate** | Ready | Orgs, users, centres, shops, tenants, leases, tickets from Postgres |
| **Ticket create / update** | Ready | `repository.ts` writes to `tickets` then updates cache |
| **RLS multi-tenant** | Ready | Schema policies; requires Auth session |
| **Public marketplace** | Ready | Public listing policies + boot hydrate |
| **Elevate / ops extras** | Partial | UI works; some helpers still session-memory until table-backed |
| **Email / SMS / MoMo** | Not in scope | Provider accounts required |
| **Automated E2E tests** | Not yet | Recommend Playwright smoke suite |

**You can run a production pilot** for login + operations on core property/ticket data **if**:

1. SQL scripts applied  
2. Auth users created  
3. Vercel env set  
4. Seed data loaded  

You should **not** claim bank-grade payments or SMS until those providers are connected.

---

## Required SQL (order)

1. `public/supabase-schema.sql`
2. `public/supabase-schema-phase3-7.sql`
3. `public/seed-demo-data.sql`
4. `public/supabase-auth-bridge.sql`
5. `public/supabase-public-marketplace.sql`

---

## Required Auth users

| Login (org / user) | Auth email |
|--------------------|------------|
| SUPER / superadmin | admin@umhlabawami.sz |
| GAB-070826 / lindiwe.admin | lindiwe@ezulwiniproperties.sz |
| GAB-070826 / sipho.manager | sipho@ezulwiniproperties.sz |
| GAB-070826 / nandi.tenant | nandi@swaziartisancrafts.sz |
| GAB-070826 / bheki.maintenance | bheki@ezulwiniproperties.sz |
| GAB-070826 / thandeka.finance | thandeka@ezulwiniproperties.sz |

Password = whatever you set in Supabase Authentication.

---

## Production smoke test

1. Open live URL — marketplace loads public units (or empty if no seed).  
2. Sign in as `sipho.manager` with real password.  
3. Centre Pulse / tickets show **seed or live** tickets.  
4. Create a ticket as tenant → row appears in Supabase Table Editor → `tickets`.  
5. Assign / resolve as manager/tech → row updates in Supabase.  
6. Sign out; sign in as another role — data scoped by RLS.  

---

## Architecture (production)

```
Browser SPA (Vercel)
  → Supabase Auth (session)
  → PostgREST + RLS (Postgres)
  → In-memory cache (db) for UI speed, rehydrated after login
  → repository.ts for durable ticket/org writes
```

---

## Remaining engineering (post-pilot)

1. Persist every commercial / Elevate mutation to Postgres tables  
2. Ticket timeline rows in `ticket_timeline`  
3. Storage buckets for real photo uploads  
4. Edge Functions for webhooks & Partner API  
5. Playwright CI against a staging Supabase project  
6. Observability (Sentry) + uptime checks  

---

## Sign-off checklist (owner)

- [ ] Supabase project healthy  
- [ ] All SQL scripts run  
- [ ] Six Auth users created  
- [ ] Vercel env vars set & redeployed  
- [ ] Smoke test passed  
- [ ] POPIA / privacy notice reviewed by counsel  
- [ ] Backup strategy noted (Supabase PITR or dumps)  

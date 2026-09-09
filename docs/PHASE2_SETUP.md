# Phase 2 Setup Guide — Supabase Backend

Phase 2 introduces a **dual-mode** architecture:

| Mode | When | Behaviour |
|------|------|-----------|
| **Demo** (default) | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` not set | localStorage data + demo login |
| **Supabase** | Both env vars set | Real Auth, PostgreSQL + RLS, Storage |

Live Vercel stays in **demo mode** until you add credentials. Owner checklist: [OWNER_SETUP.md](./OWNER_SETUP.md).

---

## 1. Create a Supabase project

1. [supabase.com](https://supabase.com) — region closest to Eswatini / South Africa if available.  
2. **Project Settings → API** → copy URL + `anon` `public` key.

## 2. Apply schema (two scripts)

1. SQL Editor → run **`public/supabase-schema.sql`** (core tables + base RLS).  
2. SQL Editor → run **`public/supabase-schema-phase3-7.sql`** (ops, commercial, Elevate tables + starter policies).

Confirm tables under **Table Editor**.

## 3. Storage buckets

Create: `ticket-attachments`, `property-images`, `lease-documents`, `org-logos`.  
Scope policies by organisation folder prefix.

## 4. Auth users

Auth email must **exactly match** `public.users.email` (RLS helpers use JWT email).

## 5. Environment variables

```bash
cp .env.example .env.local
# set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

Vercel → Environment Variables → same keys → Redeploy.

## 6. Verify

Password login, org registration → approval, RLS isolation between orgs.

## 7. Rollback

Remove env vars or set `VITE_FORCE_DEMO_MODE=true` and redeploy.

---

## Architecture notes

- `src/lib/supabase.ts` — client + mode detection  
- `src/services/supabaseAuth.ts` / `supabaseDb.ts` — remote helpers  
- UI primarily uses in-memory `db` in demo; migrate views incrementally when live  

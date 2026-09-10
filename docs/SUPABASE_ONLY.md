# Supabase-Only Mode

As of this change, **dual-mode / localStorage mock data is removed**.

## Required

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

on Vercel and any local `.env.local`.

## Behaviour

| Before | After |
|--------|--------|
| Demo seed in browser if no env | App requires Supabase |
| Login fell back to mock users | Login is Supabase Auth only |
| `db` persisted to localStorage | `db` is in-memory, filled from Postgres after login |
| Role switcher for demos | Disabled — log in as each user |

## SQL you must have run

1. `public/supabase-schema.sql`
2. `public/supabase-schema-phase3-7.sql`
3. `public/seed-demo-data.sql`
4. `public/supabase-auth-bridge.sql`
5. `public/supabase-public-marketplace.sql` (marketplace for visitors)

Plus Auth users matching seed emails (see [GO_LIVE_SUPABASE.md](./GO_LIVE_SUPABASE.md)).

## Login

Use organisation code + username + **real Auth password** (not `password123` unless that is what you set in Supabase Auth).

## Note on Phase 3–7 extras

Some Elevate/ops helpers still keep **session memory** (not durable localStorage mock of the whole product). Core orgs, users, shops, tickets, leases come from Supabase.

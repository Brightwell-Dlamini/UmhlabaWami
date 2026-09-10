# Umhlaba Wami

**Manage Better. Respond Faster. Know More.**

Commercial property management platform and vacant-space marketplace for the Kingdom of Eswatini.

[![Live](https://img.shields.io/badge/Live-umhlaba--wami.vercel.app-black)](https://umhlaba-wami.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Supabase%20only-3ECF8E)](docs/SUPABASE_ONLY.md)

**Live:** [https://umhlaba-wami.vercel.app](https://umhlaba-wami.vercel.app)

---

## Production mode

This product runs **Supabase-only** (no localStorage mock product database).

| Required | |
|----------|--|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Anon public key |

**Setup:** [docs/GO_LIVE_SUPABASE.md](docs/GO_LIVE_SUPABASE.md) · **Readiness:** [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md) · **Delivery:** [docs/PHASES_1_TO_7_DELIVERY_REPORT.md](docs/PHASES_1_TO_7_DELIVERY_REPORT.md)

### SQL (run in order)

1. `public/supabase-schema.sql`
2. `public/supabase-schema-phase3-7.sql`
3. `public/seed-demo-data.sql`
4. `public/supabase-auth-bridge.sql`
5. `public/supabase-public-marketplace.sql`

### Login

Organisation code + username + **Supabase Auth password** (Auth user email must match `public.users.email`).

| Role | Org | Username |
|------|-----|----------|
| Super Admin | `SUPER` | `superadmin` |
| Org Admin | `GAB-070826` | `lindiwe.admin` |
| Property Manager | `GAB-070826` | `sipho.manager` |
| Tenant | `GAB-070826` | `nandi.tenant` |
| Maintenance | `GAB-070826` | `bheki.maintenance` |
| Finance | `GAB-070826` | `thandeka.finance` |

---

## Local

```bash
cp .env.example .env.local   # fill Supabase keys
npm install && npm run dev
```

---

**Umhlaba Wami** — Built for commercial property excellence in Eswatini.

# Owner Setup Checklist — What Only You Can Do

**Purpose:** Everything required to take Umhlaba Wami from **demo / dual-mode** to a **real multi-user production system**. These items need your accounts, money, legal review, or physical/ops work.

**Live demo:** https://umhlaba-wami.vercel.app  

---

## Division of labour

| I can (implemented in repo) | I cannot (your column) |
|-----------------------------|------------------------|
| ✅ Write code, SQL, docs, UI | Create Supabase/Vercel/email/SMS/MoMo accounts |
| ✅ Design API contracts (`openapi.json`, `API_CONTRACTS.md`) | Hold or rotate live secrets |
| ✅ Simulate payments & webhooks (Elevate + partnerApi) | Settle real money or sign merchant agreements |
| ✅ Draft POPIA UX (Elevate) + draft privacy outline | Act as your lawyer or DPO |
| ✅ Draft lease UX (pipeline, renewals, legal outline) | Give binding Eswatini legal advice or execute leases |
| ✅ Deploy via connected GitHub/Vercel (main → live) | Physically train staff or sticker QR codes on doors |

**Status:** The **I can** column is **fully delivered** in the repository as of Phase 7 + this completion pass. Remaining work is exclusively the **I cannot** column below.

### Evidence (I can)

| Deliverable | Location |
|-------------|----------|
| Application UI + services Phases 1–7 | `src/` |
| Core SQL + RLS | `public/supabase-schema.sql` |
| Phase 3–7 SQL extensions | `public/supabase-schema-phase3-7.sql` |
| OpenAPI + contract notes | `public/openapi.json`, `docs/API_CONTRACTS.md` |
| Payment / webhook simulation | Elevate tabs + `partnerApi` / `phase7Service` |
| POPIA UX | Elevate → POPIA |
| Lease UX | Leasing pipeline, renewals, `docs/LEGAL_DRAFTS.md` |
| Message copy for your providers | `docs/MESSAGE_TEMPLATES.md` |
| Deployment | Vercel project on `main` |
| Owner checklist | This file |

---

## 1. Accounts & access (you)

| Item | Why |
|------|-----|
| Supabase project | Real Auth, Postgres, Storage, Realtime |
| Vercel access | Env vars, domains |
| Domain (optional) | Custom / white-label |
| Transactional email | Alerts, digests |
| SMS (+268) | Emergency SLA |
| MTN MoMo / bank merchant | Real collections |
| Error monitoring (optional) | Production visibility |
| E-sign vendor (optional) | Binding leases |

---

## 2. Secrets (you — never commit)

| Variable | Where |
|----------|--------|
| `VITE_SUPABASE_URL` | Vercel + `.env.local` |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env.local` |
| Service role key | **Server/Edge only** |
| Email / SMS / MoMo API keys | Server/Edge only |

---

## 3. Supabase (you run in console)

1. Create project  
2. Run `public/supabase-schema.sql`  
3. Run `public/supabase-schema-phase3-7.sql`  
4. Create storage buckets (ticket-attachments, property-images, lease-documents, org-logos)  
5. Create Auth users matching `users.email`  
6. Seed real org/units/tenants  
7. Set Vercel env vars → redeploy  
8. Verify RLS between two orgs  

Detail: [PHASE2_SETUP.md](./PHASE2_SETUP.md)

---

## 4. Payments (you)

- MTN MoMo Business / bank merchant  
- Settlement entity, reference standard, platform fee terms  

---

## 5. Messaging (you)

- Email + SMS providers  
- Use copy from [MESSAGE_TEMPLATES.md](./MESSAGE_TEMPLATES.md)  

---

## 6. Legal (you + counsel)

- Rewrite [LEGAL_DRAFTS.md](./LEGAL_DRAFTS.md) with qualified Eswatini counsel  
- POPIA information officer, retention policy  

---

## 7. Pilot ops (you)

- One real centre, QR stickers, train manager + tech, remove demo seed from production  

---

## Minimum path to pilot

1. Supabase + both SQL files  
2. Auth users  
3. Vercel env + redeploy  
4. Real centre data  
5. Email provider  
6. Legal basics  
7. Train two roles  

# Umhlaba Wami

**Manage Better. Respond Faster. Know More.**

Commercial property management platform and vacant-space marketplace for shopping centres and commercial properties in the Kingdom of Eswatini.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff)](https://vitejs.dev/)
[![Live](https://img.shields.io/badge/Live-umhlaba--wami.vercel.app-black)](https://umhlaba-wami.vercel.app)
[![Phase](https://img.shields.io/badge/Phases%201–4-Complete-success)](docs/ROADMAP.md)

**Live demo:** [https://umhlaba-wami.vercel.app](https://umhlaba-wami.vercel.app)

---

## Vision

Umhlaba Wami (“My Land” in siSwati) is a **world-class digital operating system for commercial real estate in Eswatini** — marketplace + operations + commercial finance in one product.

Full vision: **[docs/VISION.md](docs/VISION.md)** · Roadmap: **[docs/ROADMAP.md](docs/ROADMAP.md)**

---

## Current status — Phases 1–4 complete

| Phase | Focus | Status |
|-------|--------|--------|
| **1** Foundation | Multi-role SPA, domain model, mobile nav, docs | ✅ |
| **2** Real backend | Dual-mode Supabase client, RLS schema, Auth path, Vercel | ✅ (activate with your keys) |
| **3** Operations | Centre Pulse, SLA matrix, escalation, PM, vendors, roster | ✅ |
| **4** Commercial | Leasing pipeline, rent roll & arrears, deposits, board packs, subscriptions | ✅ |
| **5** Intelligence | Analytics depth, AI assist, permissions | Planned |
| **6** Ecosystem | APIs, white-label, PWA | Planned |

### What you can do today

- **Public marketplace** — vacant commercial units (Emalangeni), enquiries, landlord leads  
- **Six role portals** — Tenant, Property Manager, Maintenance, Finance, Org Admin, Super Admin  
- **Operations** — SLA tickets, Centre Pulse, preventive maintenance, staff roster, vendors  
- **Commercial** — leasing kanban pipeline (enquiry → signed lease), rent roll with aging, deposit ledger, board-pack export, org subscription billing  
- **Demo data** rooted in Eswatini centres (e.g. Ezulwini / Gables-style portfolio)

---

## Getting started

```bash
git clone https://github.com/Brightwell-Dlamini/UmhlabaWami.git
cd UmhlabaWami
npm install
npm run dev
```

Open http://localhost:3000

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (port 3000) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Type-check (`tsc --noEmit`) |

### Optional Supabase (Phase 2)

Copy `.env.example` → `.env.local`, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, run `public/supabase-schema.sql`. Without env vars the app runs in **demo mode** (localStorage). Guide: [docs/PHASE2_SETUP.md](docs/PHASE2_SETUP.md).

---

## Demo accounts

Organisation Code + Username (demo password accepted as any value):

| Role | Organisation Code | Username |
|------|-------------------|----------|
| Super Admin | `SUPER` | `superadmin` |
| Org Admin | `GAB-070826` | `lindiwe.admin` |
| Property Manager | `GAB-070826` | `sipho.manager` |
| Tenant | `GAB-070826` | `nandi.tenant` |
| Maintenance | `GAB-070826` | `bheki.maintenance` |
| Finance | `GAB-070826` | `thandeka.finance` |

One-click buttons are available in the Login modal.

**Suggested tour (Phase 4):** Manager → Centre Pulse → Leasing Pipeline → Rent Roll & Arrears → Board Pack. Finance → Deposits. Super Admin → Subscription Billing.

---

## Tech stack

- React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4  
- Dual-mode data: localStorage demo **or** Supabase (`@supabase/supabase-js`)  
- Services: `db.ts`, `auth.ts`, `opsService.ts` (Phase 3), `commercialService.ts` (Phase 4)  
- Deployed on **Vercel** (GitHub `main` auto-deploy)

---

## Documentation

| Document | Description |
|----------|-------------|
| [Roadmap](docs/ROADMAP.md) | Phased plan |
| [Phase 1–4 completion](docs/PHASE4_COMPLETION.md) | Latest completion record |
| [Phase 3](docs/PHASE3_COMPLETION.md) · [Phase 2](docs/PHASE2_COMPLETION.md) · [Phase 1](docs/PHASE1_COMPLETION.md) | Prior phases |
| [Vision](docs/VISION.md) | Idea bank |
| [Architecture](docs/ARCHITECTURE.md) | Technical design |
| [Data model](docs/DATA_MODEL.md) | Entities & schema |
| [User guide](docs/USER_GUIDE.md) | Role usage |
| [Deployment](docs/DEPLOYMENT.md) | Production notes |
| [Phase 2 setup](docs/PHASE2_SETUP.md) | Supabase activation |

---

**Umhlaba Wami** — Built for commercial property excellence in the Kingdom of Eswatini.

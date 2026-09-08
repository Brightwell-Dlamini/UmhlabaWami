# Umhlaba Wami

**Manage Better. Respond Faster. Know More.**

Commercial property management platform and vacant space marketplace designed for shopping centres and commercial properties in the Kingdom of Eswatini.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

---

## Vision

Umhlaba Wami (“My Land” in siSwati) is being built as a **world-class digital operating system for commercial real estate in Eswatini**. It combines a modern vacant-space marketplace with an enterprise-grade operations platform so that landlords, property managers, technicians, finance teams, and tenants can run their entire commercial relationship in one place.

The product aims for Silicon Valley standards of craft, reliability, and user experience while remaining deeply local — Emalangeni pricing, Eswatini centres, and the practical realities of managing retail and commercial space in Mbabane, Manzini, Ezulwini, Matsapha and beyond.

See **[docs/VISION.md](docs/VISION.md)** for the full product vision and idea bank, and **[docs/ROADMAP.md](docs/ROADMAP.md)** for the phased delivery plan.

---

## Current Status — Phase 1 (Foundation)

The repository currently contains a rich, multi-role React single-page application with:

- Public marketplace for vacant commercial units
- Role-based dashboards (Tenant, Property Manager, Maintenance, Finance, Org Admin, Super Admin)
- SLA-aware maintenance ticketing with timelines and completion workflows
- Lease and organisation management foundations
- Finance, staff, vendor, and announcement views
- Realistic Eswatini-centric demo data
- Production-oriented PostgreSQL / Supabase schema and starter RLS policies

This is **Phase 1**. The data layer is still client-side (in-memory + localStorage). Subsequent phases will introduce a real multi-tenant backend, deepen operations and commercial workflows, add intelligence, and harden the platform for production use at scale.

---

## Key Features (Phase 1)

| Area | Capabilities |
|------|--------------|
| **Marketplace** | Public listing of available units, featured properties, enquiry forms, landlord lead capture |
| **Authentication** | Organisation-code + username login, super-admin access, role-based session restoration |
| **Tenant Portal** | Overview, ticket creation & tracking, lease documents, announcements |
| **Manager Portal** | Dashboard KPIs, ticket assignment, broadcasts, units directory, tenants list |
| **Maintenance Portal** | Job queue, completion workflows (notes, materials, before/after images, cost & time) |
| **Finance Portal** | Rent roll, expense ledger, transactions, financial requests, document vault |
| **Admin / Super Admin** | Organisation approval, subscription management, user management, audit logs, public listing control |
| **Operations** | Staff shifts, vendor directory & ratings, centre announcements, emergency alerts, messaging |
| **Compliance** | SLA response/resolution timers, status tracking (Compliant / Warning / Overdue / Escalated) |

---

## Technology Stack

- **Frontend**: React 19, TypeScript 5.8, Vite 6
- **Styling**: Tailwind CSS 4, Lucide React icons, Motion animations
- **State / Data**: Custom in-memory database service (`src/services/db.ts`) with localStorage persistence and pub/sub updates
- **Auth**: Custom `AuthService` (`src/services/auth.ts`) with role permission matrix
- **Backend target**: Supabase (PostgreSQL + RLS) — schema supplied in `public/supabase-schema.sql`
- **AI capability flag**: Google GenAI (declared for future server-side use)

---

## Project Structure

```
UmhlabaWami/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── metadata.json
├── public/
│   └── supabase-schema.sql
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/index.ts
│   ├── services/
│   │   ├── auth.ts
│   │   └── db.ts
│   └── components/
│       ├── auth/
│       ├── layout/
│       ├── marketplace/
│       ├── dashboard/
│       ├── management/
│       └── tickets/
└── docs/
    ├── ROADMAP.md          ← Phased delivery plan
    ├── VISION.md           ← Product vision & idea bank
    ├── ARCHITECTURE.md
    ├── DATA_MODEL.md
    ├── USER_GUIDE.md
    └── DEPLOYMENT.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+ (recommended)
- npm, yarn, pnpm, or Bun

### Installation

```bash
git clone https://github.com/Brightwell-Dlamini/UmhlabaWami.git
cd UmhlabaWami
npm install
npm run dev
```

Open http://localhost:3000.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run clean` | Remove build artefacts |

---

## Demo Accounts

Login requires **Organisation Code** + **Username** (password is accepted but not validated in the current demo layer).

| Role | Organisation Code | Username |
|------|-------------------|----------|
| Super Admin | `SUPER` or `ADMIN` | `superadmin` |
| Organisation Admin | `GAB-070826` | `lindiwe.admin` |
| Property Manager | `GAB-070826` | `sipho.manager` |
| Tenant | `GAB-070826` | `nandi.tenant` |
| Maintenance | `GAB-070826` | `bheki.maintenance` |
| Finance | `GAB-070826` | `thandeka.finance` |

---

## Subscription Tiers (Planned Commercial Model)

| Tier | Properties | Tenants | Users | Storage | Monthly (E) |
|------|------------|---------|-------|---------|-------------|
| Starter | 3 | 100 | 10 | 10 GB | 1 450 |
| Professional | 10 | 500 | 50 | 50 GB | 3 850 |
| Enterprise | Unlimited | Unlimited | Unlimited | 500 GB | 8 900 |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Roadmap](docs/ROADMAP.md) | Phased plan from current foundation to category-defining platform |
| [Vision & Idea Bank](docs/VISION.md) | Long-term vision and extensive feature ideas |
| [Architecture](docs/ARCHITECTURE.md) | Technical architecture and extension points |
| [Data Model](docs/DATA_MODEL.md) | Domain entities and schema |
| [User Guide](docs/USER_GUIDE.md) | Role-based usage guide |
| [Deployment](docs/DEPLOYMENT.md) | Production considerations |

---

## Roadmap at a Glance

1. **Phase 1 — Foundation** (current) — Complete, polished multi-role SPA and domain model  
2. **Phase 2 — Real Backend** — Supabase multi-tenancy, auth, storage, security  
3. **Phase 3 — Operations Excellence** — World-class ticketing, SLA, staff & vendor workflows  
4. **Phase 4 — Commercial Engine** — Full leasing lifecycle, marketplace growth, finance depth  
5. **Phase 5 — Intelligence & Scale** — Analytics, AI assistance, enterprise controls  
6. **Phase 6 — Ecosystem & Polish** — APIs, integrations, mobile, continuous excellence  

---

## Licence

Proprietary — All rights reserved. Contact the repository owner for licensing enquiries.

---

**Umhlaba Wami** — Built for commercial property excellence in the Kingdom of Eswatini.

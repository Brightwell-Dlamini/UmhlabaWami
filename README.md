# Umhlaba Wami

**Manage Better. Respond Faster. Know More.**

Commercial property management platform and vacant space marketplace designed for shopping centres and commercial properties in the Kingdom of Eswatini.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Phase](https://img.shields.io/badge/Phase%201-Complete-success)](docs/PHASE1_COMPLETION.md)

---

## Vision

Umhlaba Wami (“My Land” in siSwati) is being built as a **world-class digital operating system for commercial real estate in Eswatini**. It combines a modern vacant-space marketplace with an enterprise-grade operations platform so that landlords, property managers, technicians, finance teams, and tenants can run their entire commercial relationship in one place.

See **[docs/VISION.md](docs/VISION.md)** and **[docs/ROADMAP.md](docs/ROADMAP.md)** for the full vision and phased plan.

---

## Current Status — Phase 1 Complete ✅

Phase 1 (Foundation) is complete. The application is a polished multi-role SPA with:

- Public marketplace for vacant commercial units
- Role-based dashboards (Tenant, Property Manager, Maintenance, Finance, Org Admin, Super Admin)
- Desktop sidebar + mobile bottom navigation
- SLA-aware maintenance ticketing with timelines and completion workflows
- Lease and organisation management foundations
- Finance, staff, vendor, and announcement views
- Realistic Eswatini-centric demo data
- Production-oriented PostgreSQL / Supabase schema
- Login credentials aligned with seed data

**Next:** Phase 2 — Real multi-tenant backend (Supabase Auth, RLS, Storage).

Details: [docs/PHASE1_COMPLETION.md](docs/PHASE1_COMPLETION.md)

---

## Getting Started

```bash
git clone https://github.com/Brightwell-Dlamini/UmhlabaWami.git
cd UmhlabaWami
npm install
npm run dev
```

Open http://localhost:3000.

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (port 3000) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Type-check (`tsc --noEmit`) |

---

## Demo Accounts

Login requires **Organisation Code** + **Username**. Password is accepted but not validated in the demo layer. Use the one-click buttons in the Login modal, or enter manually:

| Role | Organisation Code | Username |
|------|-------------------|----------|
| Super Admin | `SUPER` | `superadmin` |
| Organisation Admin | `GAB-070826` | `lindiwe.admin` |
| Property Manager | `GAB-070826` | `sipho.manager` |
| Tenant | `GAB-070826` | `nandi.tenant` |
| Maintenance | `GAB-070826` | `bheki.maintenance` |
| Finance | `GAB-070826` | `thandeka.finance` |

You can also switch roles instantly via the **Role** control in the Navbar (demo convenience).

---

## Technology Stack

- React 19, TypeScript 5.8, Vite 6
- Tailwind CSS 4, Lucide React, Motion
- In-memory + localStorage data layer (`src/services/db.ts`) — Phase 1
- Custom AuthService with role permission matrix
- Target backend: Supabase (PostgreSQL + RLS) — schema in `public/supabase-schema.sql`

---

## Documentation

| Document | Description |
|----------|-------------|
| [Phase 1 Completion](docs/PHASE1_COMPLETION.md) | What was delivered and how to verify |
| [Roadmap](docs/ROADMAP.md) | Phased plan to category-defining platform |
| [Vision & Idea Bank](docs/VISION.md) | Long-term vision and feature ideas |
| [Architecture](docs/ARCHITECTURE.md) | Technical architecture |
| [Data Model](docs/DATA_MODEL.md) | Domain entities and schema |
| [User Guide](docs/USER_GUIDE.md) | Role-based usage |
| [Deployment](docs/DEPLOYMENT.md) | Production considerations |

---

## Roadmap at a Glance

1. **Phase 1 — Foundation** ✅ Complete  
2. **Phase 2 — Real Backend** ← Next  
3. **Phase 3 — Operations Excellence**  
4. **Phase 4 — Commercial Engine**  
5. **Phase 5 — Intelligence & Scale**  
6. **Phase 6 — Ecosystem & Polish**  

---

**Umhlaba Wami** — Built for commercial property excellence in the Kingdom of Eswatini.

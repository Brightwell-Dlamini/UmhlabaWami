# Umhlaba Wami

**Manage Better. Respond Faster. Know More.**

Commercial property management platform and vacant space marketplace designed for shopping centres and commercial properties in Eswatini.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

---

## Overview

Umhlaba Wami ("My Land" in siSwati) is a multi-tenant commercial property operations platform that combines:

- **Public marketplace** for vacant retail, office, warehouse, restaurant, and kiosk units
- **Role-based operations dashboards** for tenants, property managers, maintenance technicians, finance teams, organisation admins, and platform super-admins
- **SLA-driven maintenance ticketing** with timelines, attachments, ratings, and escalations
- **Lease and SLA agreement management**
- **Finance portal** (rent roll, expenses, transactions, approvals)
- **Staff scheduling, vendor management, announcements, and emergency broadcasts**
- **Organisation onboarding with subscription tiers** (Starter / Professional / Enterprise)

The application is currently implemented as a rich client-side React single-page application with an in-memory/localStorage persistence layer that mirrors a production Supabase (PostgreSQL) schema. A production schema and Row-Level Security policies are provided in `public/supabase-schema.sql`.

---

## Key Features

| Area | Capabilities |
|------|--------------|
| **Marketplace** | Public listing of available units, featured properties, enquiry forms, lead capture for landlords |
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
- **Backend target**: Supabase (PostgreSQL + RLS) — schema supplied
- **AI capability flag**: Google GenAI (declared in metadata for future server-side use)

---

## Project Structure

```
UmhlabaWami/
├── index.html                 # App shell & meta tags
├── package.json
├── vite.config.ts
├── tsconfig.json
├── metadata.json              # Product name, description, capabilities
├── public/
│   └── supabase-schema.sql    # Production PostgreSQL schema + sample RLS
├── src/
│   ├── main.tsx
│   ├── App.tsx                # Root routing / view orchestration
│   ├── index.css
│   ├── types/index.ts         # Domain TypeScript interfaces & unions
│   ├── services/
│   │   ├── auth.ts            # Authentication & permission helpers
│   │   └── db.ts              # Demo data, CRUD helpers, audit logging
│   └── components/
│       ├── auth/              # LoginModal, RegisterOrgModal
│       ├── layout/            # Navbar, Sidebar, Footer
│       ├── marketplace/       # Public listings, property cards & modals
│       ├── dashboard/         # Role-specific portals & operational views
│       ├── management/        # Units directory, Lease management
│       └── tickets/           # CreateTicketWizard, TicketDetailModal
└── docs/                      # Extended documentation (this set)
    ├── ARCHITECTURE.md
    ├── DATA_MODEL.md
    ├── USER_GUIDE.md
    └── DEPLOYMENT.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+ (recommended)
- Bun or npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Brightwell-Dlamini/UmhlabaWami.git
cd UmhlabaWami

# Install dependencies (example with npm)
npm install

# Start development server (port 3000)
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

The seed data includes realistic Eswatini organisations and users. Login requires **Organisation Code** + **Username** (password is currently accepted but not validated in the demo layer).

| Role | Organisation Code | Username |
|------|-------------------|----------|
| Super Admin | `SUPER` or `ADMIN` | `superadmin` |
| Organisation Admin | `GAB-070826` | `lindiwe.admin` |
| Property Manager | `GAB-070826` | `sipho.manager` |
| Tenant | `GAB-070826` | `nandi.tenant` |
| Maintenance | `GAB-070826` | `bheki.maintenance` |
| Finance | `GAB-070826` | `thandeka.finance` |

Additional organisations (Swazi Plaza, Riverstone) are seeded for multi-tenant testing. One organisation remains in `Pending Approval` status to demonstrate the super-admin approval workflow.

---

## Subscription Tiers

| Tier | Properties | Tenants | Users | Storage | Monthly (E) |
|------|------------|---------|-------|---------|-------------|
| Starter | 3 | 100 | 10 | 10 GB | 1 450 |
| Professional | 10 | 500 | 50 | 50 GB | 3 850 |
| Enterprise | Unlimited | Unlimited | Unlimited | 500 GB | 8 900 |

---

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Data Model & Schema](docs/DATA_MODEL.md)
- [User Guide by Role](docs/USER_GUIDE.md)
- [Deployment & Production Notes](docs/DEPLOYMENT.md)

---

## Roadmap / Production Considerations

- Replace localStorage `db` service with Supabase client (Auth, Realtime, Storage)
- Enforce password hashing and proper JWT / session management
- Complete Row-Level Security policies for all tables
- Wire Google GenAI for intelligent ticket triage / summarisation (capability already declared)
- Export integrations (Sage / QuickBooks) for finance
- Mobile-responsive refinements and PWA packaging

---

## Licence

Proprietary — All rights reserved. Contact the repository owner for licensing enquiries.

---

**Umhlaba Wami** — Built for commercial property excellence in the Kingdom of Eswatini.

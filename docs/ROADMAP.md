# Umhlaba Wami — Product Roadmap & Phased Delivery Plan

**Vision Statement**  
Umhlaba Wami will become the definitive digital operating system for commercial real estate in the Kingdom of Eswatini — combining a vibrant vacant-space marketplace with an enterprise-grade property operations platform. It will deliver Silicon Valley standards of product craft, reliability, and user experience while remaining deeply rooted in local market realities (Emalangeni pricing, local banking, Eswatini labour law, centre culture, and the unique rhythm of shopping centres in Mbabane, Manzini, Ezulwini, Matsapha and beyond).

**North-Star Outcome**  
A landlord, property manager, technician, finance officer, or tenant can run their entire commercial relationship through Umhlaba Wami — from discovering a vacant unit, signing a digitally executed lease, paying rent, raising and resolving maintenance tickets under enforceable SLAs, receiving emergency alerts, viewing financial performance, and generating board-ready reports — without leaving the platform.

---

## Phase Overview

| Phase | Codename | Primary Goal | Status |
|-------|----------|--------------|--------|
| **1** | Foundation | Solid, demonstrable multi-role SPA with complete domain model and production-ready schema | **Complete** |
| **2** | Real Backend | Replace demo data layer with true multi-tenant backend, auth, storage, and security | Next |
| **3** | Operations Excellence | Deepen ticketing, SLA, maintenance, vendor, and staff workflows | Planned |
| **4** | Commercial & Marketplace | Full leasing lifecycle, marketplace growth engine, payments, and financial intelligence | Planned |
| **5** | Intelligence & Scale | Analytics, AI assistance, integrations, mobile, compliance | Planned |
| **6** | Ecosystem & Polish | Open APIs, partner ecosystem, white-label readiness, continuous excellence | Planned |

See [PHASE1_COMPLETION.md](./PHASE1_COMPLETION.md) for the Phase 1 completion record and verification checklist.

---

## Phase 1 — Foundation ✅ Complete

**Objective**  
Turn the existing rich client-side prototype into a polished, internally consistent, fully navigable, and documented product foundation.

### Delivered

- Coherent dashboards for all six roles with working navigation (desktop sidebar + mobile bottom nav)
- Functional modals: Login, Register Organisation, Create Ticket, Property Detail, Enquiry, Broadcast, Ticket Detail
- Public marketplace with enquiries and landlord lead capture
- Dark mode across the application
- Login credentials aligned with seed data (`GAB-070826` / role usernames; `SUPER` / `superadmin`)
- Organisation registration → Super Admin approval path demonstrable
- Ticket lifecycle helpers in `DbService` (create, assign, accept, resolve, confirm)
- TypeScript domain model aligned with `public/supabase-schema.sql`
- Documentation: README, ROADMAP, VISION, ARCHITECTURE, DATA_MODEL, USER_GUIDE, DEPLOYMENT, PHASE1_COMPLETION

### Explicitly deferred to Phase 2+

- Real authentication and server-side security
- Persistent storage beyond localStorage
- Production file uploads, email/SMS, payments

---

## Phase 2 — Real Backend & Multi-Tenancy (Next)

**Objective**  
Replace the localStorage simulation with a production-grade, multi-tenant backend.

### Core Deliverables
- Supabase project with full schema + refined RLS policies
- Supabase Auth integrated with Organisation Code + Username experience
- Secure file storage for attachments, images, lease PDFs, logos
- Environment-based configuration (staging vs production)
- Seed / migration scripts for UAT
- Server-side audit logging

**Definition of Done**  
Two independent organisations can register, be approved, and operate simultaneously with complete data isolation. Files survive page refreshes. Authentication is no longer a client-side simulation.

---

## Phase 3 — Operations Excellence

Deepen ticket workflows, configurable SLAs, staff rostering, vendor management, announcements, and a mobile-optimised technician experience so a property manager can run a centre without WhatsApp/spreadsheets for core processes.

---

## Phase 4 — Commercial Engine & Marketplace

End-to-end leasing pipeline, marketplace growth features, rent roll and arrears, deposit workflows, board-pack exports, and organisation subscription billing.

---

## Phase 5 — Intelligence, Scale & Trust

Portfolio analytics, AI-assisted ticket triage and natural-language queries, granular permissions, compliance audit trails, notification centre foundations, multi-centre portfolio views.

---

## Phase 6 — Ecosystem, Polish & Category Leadership

Public/partner API, deep integrations, white-label options, native/PWA mobile, POPIA-aligned handling, continuous design and reliability excellence.

---

## Cross-Cutting Principles

1. **Eswatini First, World-Class Always**
2. **Role Clarity**
3. **Auditability & Trust**
4. **Progressive Disclosure**
5. **Data Ownership**
6. **Security by Design** (from Phase 2 onward)
7. **Measurable Progress** — each phase has an explicit Definition of Done

---

## Immediate Next Steps

1. Begin Phase 2 technical design (Supabase project, Auth strategy, RLS policy matrix).
2. Decide priority order: Auth first vs Schema + RLS first.
3. Keep Phase 1 experience stable while the backend migration is prepared.

This roadmap is a living document.

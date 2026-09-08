# Umhlaba Wami — Product Roadmap & Phased Delivery Plan

**Vision Statement**  
Umhlaba Wami will become the definitive digital operating system for commercial real estate in the Kingdom of Eswatini — combining a vibrant vacant-space marketplace with an enterprise-grade property operations platform. It will deliver Silicon Valley standards of product craft, reliability, and user experience while remaining deeply rooted in local market realities (Emalangeni pricing, local banking, Eswatini labour law, centre culture, and the unique rhythm of shopping centres in Mbabane, Manzini, Ezulwini, Matsapha and beyond).

**North-Star Outcome**  
A landlord, property manager, technician, finance officer, or tenant can run their entire commercial relationship through Umhlaba Wami — from discovering a vacant unit, signing a digitally executed lease, paying rent, raising and resolving maintenance tickets under enforceable SLAs, receiving emergency alerts, viewing financial performance, and generating board-ready reports — without leaving the platform.

---

## Phase Overview

| Phase | Codename | Primary Goal | Target Maturity |
|-------|----------|--------------|-----------------|
| **1** | Foundation | Solid, demonstrable multi-role SPA with complete domain model and production-ready schema | Current → Complete |
| **2** | Real Backend | Replace demo data layer with true multi-tenant backend, auth, storage, and security | Production-capable core |
| **3** | Operations Excellence | Deepen ticketing, SLA, maintenance, vendor, and staff workflows into best-in-class operations tools | World-class ops |
| **4** | Commercial & Marketplace | Full leasing lifecycle, marketplace growth engine, payments, and financial intelligence | Revenue & growth engine |
| **5** | Intelligence & Scale | Analytics, AI assistance, integrations, mobile, compliance, and multi-centre portfolio power | Platform of record |
| **6** | Ecosystem & Polish | Open APIs, partner ecosystem, white-label readiness, continuous excellence | Category-defining product |

Each phase ends with a clear “Definition of Done” so progress is measurable.

---

## Phase 1 — Foundation (Current Codebase → Complete)

**Objective**  
Turn the existing rich client-side prototype into a polished, internally consistent, fully navigable, and documented product foundation that can be confidently shown to stakeholders and used as the single source of truth for all subsequent engineering.

### What Phase 1 Must Look Like When Complete

#### Product & Experience
- Every role (Tenant, Property Manager, Maintenance, Finance, Org Admin, Super Admin) has a coherent, non-broken dashboard with working navigation and sensible default landing views.
- All major modals and wizards (Login, Register Organisation, Create Ticket, Property Detail, Enquiry, Broadcast, Ticket Detail) are fully functional against the in-memory store and provide clear success/error feedback.
- Public marketplace is visually polished, filterable, and capable of driving enquiries and landlord leads.
- Dark mode works consistently across the entire application.
- Responsive behaviour is acceptable on tablet and modern mobile viewports (even if not yet a dedicated mobile app).
- Empty states, loading states, and basic validation are present so the product never feels “half-built”.

#### Domain Completeness
- Seed data covers multiple realistic Eswatini centres, mixed unit types, active and pending organisations, and sample tickets across the full lifecycle.
- Ticket creation, assignment, status transitions, timeline entries, and basic completion fields all persist and re-render correctly.
- Organisation registration → Super Admin approval → login flow is end-to-end demonstrable.
- Role permission matrix is enforced in the UI (buttons and routes that a role should not see are hidden or disabled).

#### Technical Hygiene
- TypeScript types are complete and consistent with the Supabase schema.
- No critical console errors or broken imports.
- README, Architecture, Data Model, User Guide, and this Roadmap are accurate and up to date.
- Clear separation between presentation, auth service, and data service so Phase 2 can replace the data layer without rewriting the UI.

#### Explicitly Out of Scope for Phase 1
- Real authentication, passwords, or server-side security
- Real file uploads or persistent storage beyond localStorage
- Payments, email, SMS, or push notifications
- Production deployment with real users

**Definition of Done (Phase 1)**  
A stakeholder can log in as any of the six roles, perform the core happy-path actions for that role, switch organisations via Super Admin, and experience a coherent product narrative from public marketplace → organisation onboarding → day-to-day operations. All documentation reflects reality.

---

## Phase 2 — Real Backend & Multi-Tenancy

**Objective**  
Replace the localStorage simulation with a production-grade, multi-tenant backend so that data is secure, concurrent, and durable.

### Core Deliverables
- Supabase (or equivalent) project with the full schema from `public/supabase-schema.sql` plus refined RLS policies for every table and operation.
- Supabase Auth integrated with the existing Organisation Code + Username (or email) login experience; proper session management and logout.
- Secure file storage for ticket attachments, property images, lease PDFs, and organisation logos.
- Real-time or near-real-time updates for tickets and announcements (optional but highly desirable).
- Environment-based configuration (staging vs production).
- Seed / migration scripts for controlled demo and UAT data.
- Basic audit logging written server-side.

### World-Class Touches
- Row-Level Security that makes multi-tenancy airtight (an organisation can never see another organisation’s data).
- Soft deletes and retention policies where appropriate.
- Database-level constraints that mirror the TypeScript domain rules.
- Automated backups and point-in-time recovery.

**Definition of Done (Phase 2)**  
Two independent organisations can register, be approved, and operate simultaneously with complete data isolation. Files survive page refreshes and browser clears. Authentication is no longer a client-side simulation.

---

## Phase 3 — Operations Excellence

**Objective**  
Make the day-to-day running of a shopping centre or commercial portfolio feel effortless and professional — the part of the product that property managers and technicians will use for hours every day.

### Key Capabilities to Build or Deepen
- Advanced ticket workflows: prioritisation rules, automatic escalation, reassignment, multi-technician collaboration, parts & materials tracking, cost capture, and tenant confirmation loops.
- Configurable SLA templates per property or tenant with warning thresholds and automatic escalations (email/SMS later).
- Staff rostering with shift types, leave, on-call, and basic conflict detection.
- Vendor management: contracts, performance ratings, preferred-vendor routing for certain ticket categories, and expiry alerts.
- Centre announcements and true emergency broadcast centre (with acknowledgment tracking in later phases).
- In-app messaging / conversation threads linked to tickets or general centre communication.
- Mobile-optimised technician experience (even within the responsive web app) optimised for one-handed use on site.

### Ideas for Differentiation
- QR codes on units that open a pre-filled ticket form for that exact shop.
- “Before / After” photo comparison view with timestamps.
- Technician productivity and SLA compliance dashboards that managers actually trust.
- Preventive maintenance schedules generated from asset/equipment data (future extension).

**Definition of Done (Phase 3)**  
A property manager can run a full week of centre operations (tickets, staff, vendors, announcements) without resorting to WhatsApp groups or spreadsheets for core processes.

---

## Phase 4 — Commercial Engine & Marketplace

**Objective**  
Turn vacant space into revenue and give landlords full control of the leasing and financial lifecycle.

### Capabilities
- End-to-end leasing pipeline: enquiry → viewing booking → offer → digital lease generation & e-signature → move-in checklist → deposit handling.
- Public marketplace growth features: SEO-friendly listing pages, featured placements, enquiry analytics, and landlord lead scoring.
- Rent roll, invoicing, payment recording, and basic arrears management (initially manual recording; later integrated payments).
- Security deposit tracking and refund workflows.
- Financial request & approval chains (petty cash, vendor payments, maintenance funding) with clear audit trails.
- Exportable reports suitable for board packs and auditors (PDF / Excel).
- Subscription billing for organisations themselves (Starter / Professional / Enterprise) with usage visibility against limits.

### Localisation & World-Class Ideas
- Emalangeni formatting, Eswatini tax considerations (VAT), and local banking reference fields.
- Integration-ready design for future Eswatini payment providers or bank file exports.
- Marketplace that feels as polished as international platforms yet speaks the language of local retailers and landlords.

**Definition of Done (Phase 4)**  
A landlord can list a unit, receive and convert an enquiry into a signed lease, collect rent, and see financial performance — all inside Umhlaba Wami.

---

## Phase 5 — Intelligence, Scale & Trust

**Objective**  
Move from “good software” to “indispensable platform” through insight, automation, and enterprise readiness.

### Capabilities
- Portfolio and centre-level analytics: occupancy, rental yield, SLA performance, ticket trends, arrears aging, footfall proxies if available.
- AI-assisted features (leveraging the already-declared GenAI capability):
  - Smart ticket categorisation and priority suggestion
  - Draft responses or completion notes
  - Anomaly detection (unusual cost, repeated failures on the same unit)
  - Natural-language queries over operational data (“Show me all emergency tickets at The Gables last quarter”)
- Advanced user & permission management (custom roles, property-level scoping).
- Comprehensive activity and compliance audit trails.
- Data export / import and basic API access for larger groups.
- Notification centre (in-app) with preferences; foundation for email/SMS/push.
- Multi-centre and multi-organisation portfolio views for enterprise clients.

**Definition of Done (Phase 5)**  
Executives can open a dashboard and immediately understand the health of their portfolio. Front-line users feel the system is actively helping them rather than merely recording their work.

---

## Phase 6 — Ecosystem, Polish & Category Leadership

**Objective**  
Make Umhlaba Wami the platform of record that other systems and partners connect to, while continuously raising the bar on craft and reliability.

### Capabilities & Ideas
- Public or partner API and webhooks.
- Deep integrations (accounting packages popular in the region, access control / CCTV systems, utility metering, marketing platforms).
- White-label or co-branded options for large property groups.
- Native mobile applications (or high-quality PWA) for technicians and managers.
- Advanced compliance packs (POPIA-aligned data handling, retention policies, consent management).
- Continuous design and performance excellence: accessibility (WCAG), internationalisation readiness (even while remaining Eswatini-first), observability, and automated testing.
- Partner marketplace or certified implementer programme.
- Thoughtful onboarding journeys, in-app education, and success metrics for customers.

**Definition of Done (Phase 6)**  
Umhlaba Wami is recognised as the most complete and trusted commercial property operating system available in Eswatini and is architecturally ready to expand regionally if desired.

---

## Cross-Cutting Principles (All Phases)

1. **Eswatini First, World-Class Always** — Local currency, local place names, local business practices, yet product quality, reliability, and design that would not look out of place in a top Silicon Valley portfolio company.
2. **Role Clarity** — Every screen must make sense for the person who uses it daily.
3. **Auditability & Trust** — Critical actions leave a clear, immutable trail.
4. **Progressive Disclosure** — Power for experts, simplicity for everyday users.
5. **Data Ownership** — Organisations own their data; the platform is the steward.
6. **Security by Design** — Especially from Phase 2 onward.
7. **Measurable Progress** — Each phase has an explicit Definition of Done.

---

## Immediate Next Steps (After This Document)

1. Close remaining gaps in Phase 1 (polish, empty states, permission enforcement, documentation accuracy).
2. Agree on priority order of Phase 2 workstreams (Auth first vs Schema + RLS first, etc.).
3. Begin detailed technical design for the Supabase transition while continuing to improve the Phase 1 experience.

This roadmap is a living document. It will be updated as we learn from users, market feedback, and implementation realities.

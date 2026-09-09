# User Guide — Umhlaba Wami

**Product status:** Phases 1–7 complete on the dual-mode demo layer. Live site: https://umhlaba-wami.vercel.app  
Until Supabase keys are configured, data is **browser-local** demo data (not a shared multi-user server).

---

## 1. Who uses the system (stakeholders)

Umhlaba Wami is built for everyone involved in commercial property in Eswatini — from someone browsing vacant shops online to the platform operator approving new property companies. Below is what each stakeholder **is**, and what they **do** on the system.

### 1.1 Public visitor (no login)

**Who they are**  
Anyone on the internet: a business owner looking for retail or office space, a broker, or a curious member of the public.

**What they do**
- Browse the **public marketplace** of vacant commercial units (retail, office, restaurant, kiosk, warehouse, etc.).
- Open unit details (size, rent in Emalangeni, features, location).
- Submit a **leasing enquiry** — this becomes a lead in the organisation’s leasing pipeline for staff to follow up.
- Submit a **List your property** lead if they are a landlord or group who wants to use the platform.

They never need an account for browsing. They only become a formal user after an organisation onboards them (e.g. as a tenant after a lease is signed).

---

### 1.2 Tenant (shop / unit occupant)

**Who they are**  
A business that occupies a commercial unit under a lease — e.g. a retailer, café, or office tenant in a shopping centre. In the product their role is `tenant`.

**Why they use the system**  
To get service without relying only on WhatsApp or paper: report problems, track repairs, see lease/SLA information, and receive centre announcements.

**What they do on the system**
| Area | Actions |
|------|--------|
| **Dashboard** | See their unit summary, open tickets, and lease status at a glance |
| **Report Issue** | Open a multi-step maintenance ticket (category, priority, description, location, optional photos) |
| **My Tickets** | Track status and timeline; confirm resolution; rate service (CSAT) where enabled |
| **Lease & SLA** | View lease and service-level agreement information |
| **Documents** | Access tenant-facing documents |
| **Announcements** | Read centre bulletins and notices |
| **Notifications / Messages** | Receive updates related to their tickets and centre |

**What they do *not* do**  
They do not manage other tenants, assign technicians, see full rent roll for the centre, or change organisation settings.

**Demo login:** org `GAB-070826` · username `nandi.tenant`

---

### 1.3 Property Manager

**Who they are**  
The on-the-ground operator of one or more centres/properties for a landlord organisation. Role: `property_manager`.

**Why they use the system**  
It is their **operations command centre**: tickets, SLAs, staff, vendors, leasing flow, and day-to-day centre health — instead of spreadsheets and chat groups.

**What they do on the system**
| Area | Actions |
|------|--------|
| **Centre Pulse** | Live view of open work, SLA pressure, and what needs attention today |
| **Tickets & SLAs** | See all centre tickets; assign, escalate, track breaches |
| **Maintenance ops / Preventive PM** | Coordinate repairs; schedule recurring facility tasks |
| **SLA Matrix** | Configure response/resolution rules by priority/category |
| **Properties & units** | Manage shops, status, and public listing flags |
| **Tenants** | Directory of occupants and quick actions |
| **Leasing pipeline** | Move enquiries through stages toward a signed lease |
| **Rent roll / Board pack** | Operational commercial visibility (as permitted) |
| **Staff roster & vendors** | Shifts and preferred contractors |
| **Announcements / Broadcast** | Centre-wide or emergency notices |
| **Elevate (P7)** | Photos, field jobs, assets, predictive actions, and more |
| **Intelligence / AI Assist** | Portfolio signals and triage help |

**Demo login:** org `GAB-070826` · username `sipho.manager`

---

### 1.4 Maintenance technician (facilities)

**Who they are**  
In-house or contracted field staff who fix units and common areas. Role: `maintenance`.

**Why they use the system**  
Clear job queue, job status on site, and completion records — less phone tag, better accountability.

**What they do on the system**
| Area | Actions |
|------|--------|
| **My Jobs** | Work the queue of tickets assigned to them |
| **Completion workflow** | Add notes, materials, time, cost, before/after evidence; mark resolved |
| **Elevate — Field** | Update job state (e.g. en route → on site → completed); use unit QR context where provided |
| **Schedule** | See shifts / roster |
| **Preventive PM** | Carry out scheduled preventive tasks |
| **Messages / notifications** | Coordinate with managers |

**What they do *not* do**  
They do not approve organisations, set subscription billing, or own the full rent roll.

**Demo login:** org `GAB-070826` · username `bheki.maintenance`

---

### 1.5 Finance user

**Who they are**  
Finance or accounts staff for the property organisation — collections, deposits, expenses, reporting. Role: `finance`.

**Why they use the system**  
One place for expected rent vs collected, arrears aging, deposits, invoices/exports, and board-level numbers without rebuilding Excel every month.

**What they do on the system**
| Area | Actions |
|------|--------|
| **Rent Roll & Arrears** | Expected vs collected, aging of outstanding amounts |
| **Deposit ledger** | Record holds, refunds, forfeits |
| **Elevate — Payments / invoices** | Record MoMo/EFT references; raise invoices; CAM allocation; Sage-oriented export |
| **Board pack** | Snapshot pack for owners/management |
| **Expenses & transactions** | Ledger and reconciliation flags |
| **Financial requests** | Approve/reject petty cash, purchases, vendor payment requests |
| **Documents** | Finance document vault |
| **Intelligence** | Portfolio commercial health where permitted |

**Demo login:** org `GAB-070826` · username `thandeka.finance`

---

### 1.6 Organisation Admin (landlord / asset-company admin)

**Who they are**  
The person who runs the **organisation** account on Umhlaba Wami — typically a senior manager or owner’s representative for a property company. Role: `admin`.

**Why they use the system**  
Full control inside their company: people, branding, ops + commercial depth, integrations, and settings — without being the platform-wide Super Admin.

**What they do on the system**
| Area | Actions |
|------|--------|
| **Everything managers see** | Pulse, tickets, leasing, units, tenants, vendors, roster |
| **Staff & roles** | Invite/manage users and role assignment within the org |
| **Branding & settings** | Organisation profile and white-label colours/name/logo |
| **Elevate (P7)** | Full Elevate hub including trust tools (POPIA, access review, DR checklist) |
| **Permissions / compliance** | Granular permission overrides; audit-oriented views |
| **Partner API** | Explore API surface for accounting/CRM hooks |
| **Platform health** | Org-facing health / PWA readiness signals |
| **Commercial + intelligence** | Rent roll, deposits, board pack, AI assist, portfolio intelligence |

**Demo login:** org `GAB-070826` · username `lindiwe.admin`

---

### 1.7 Super Admin (platform operator)

**Who they are**  
Operators of the **Umhlaba Wami product itself** (your team as the SaaS provider). Role: `super_admin`. Not tied to a single landlord org.

**Why they use the system**  
Onboard property companies, control marketplace quality, manage subscriptions, and oversee platform-wide health and compliance tools.

**What they do on the system**
| Area | Actions |
|------|--------|
| **Org approvals** | Review organisations that registered; activate, suspend, or reject |
| **All organisations** | Portfolio of every tenant-of-the-platform |
| **Subscription billing** | Tiers, limits, and platform fees |
| **Marketplace vacancies** | Oversee/control public listing visibility |
| **User directory** | Cross-org user visibility for support |
| **Elevate / intelligence / compliance** | Platform-level tools and audits |
| **Partner API / platform health** | Ecosystem and operational readiness |
| **Global analytics** | High-level platform metrics |

**Demo login:** org `SUPER` · username `superadmin`

---

### 1.8 Other stakeholders (outside the six login roles)

| Stakeholder | Relationship to the system |
|-------------|----------------------------|
| **Landlord / asset owner** | May not log in daily; they consume board packs, occupancy, and collections via Admin/Manager/Finance users who work for them |
| **Prospective tenant** | Uses the public marketplace and enquiry form before becoming a formal Tenant user |
| **Vendor / contractor company** | Represented in **Vendors** and scorecards; may not have their own login in the current product (work is coordinated by managers/techs) |
| **External systems** (accounting, CRM) | Connect via **Partner API** / webhooks once you issue real API keys in production |

---

### 1.9 Role comparison (quick)

| Stakeholder | Login role | Main job on Umhlaba Wami |
|-------------|------------|---------------------------|
| Public visitor | — | Browse space, enquire, list property lead |
| Tenant | `tenant` | Report issues, track tickets, view lease |
| Property Manager | `property_manager` | Run the centre day-to-day |
| Maintenance | `maintenance` | Execute and close jobs |
| Finance | `finance` | Collections, deposits, reports, exports |
| Org Admin | `admin` | Run the company account end-to-end |
| Super Admin | `super_admin` | Run the platform and onboard orgs |

---

## 2. Public Marketplace

Any visitor can:

- Browse available commercial units.
- Filter and open property detail (size, rent, features).
- Submit a **leasing enquiry** (feeds the leasing pipeline).
- Submit a **List your property** lead for landlord onboarding.

No login is required for browsing.

---

## 3. Logging In

1. Click **Login**.
2. Enter **Organisation Code** (e.g. `GAB-070826`) and **Username**.
3. Super Admin: org code `SUPER` / `ADMIN` or username `superadmin`.

**Demo mode:** password is not enforced.  
**Supabase mode** (when env keys are set): real email/password Auth — see [PHASE2_SETUP.md](./PHASE2_SETUP.md).

On success you land on the role-appropriate dashboard.

### Demo accounts

| Role | Org code | Username |
|------|----------|----------|
| Super Admin | `SUPER` | `superadmin` |
| Org Admin | `GAB-070826` | `lindiwe.admin` |
| Property Manager | `GAB-070826` | `sipho.manager` |
| Tenant | `GAB-070826` | `nandi.tenant` |
| Maintenance | `GAB-070826` | `bheki.maintenance` |
| Finance | `GAB-070826` | `thandeka.finance` |

---

## 4. Creating a maintenance ticket

1. **Report Issue** / create ticket (typically Tenant; managers can also create).  
2. Category, priority, title, description, location.  
3. Attach images if needed (Elevate photo evidence for staff).  
4. Submit — ticket number issued; SLA timers apply.  

Managers assign; technicians see jobs once assigned. Elevate **Field** tracks on-site progress.

---

## 5. Centre operations (managers / admins)

- **Centre Pulse** — open work, SLA pressure, today’s focus  
- **SLA Matrix** — response/resolution rules  
- **Preventive PM** — scheduled facility tasks  
- **Broadcast** — emergency/high-priority announcements (banner for logged-in ops users)  

---

## 6. Commercial (managers / finance / admin)

- **Leasing pipeline** — enquiry → signed (Kanban)  
- **Rent roll & arrears** — expected vs collected, aging  
- **Deposit ledger** — hold / refund / forfeit  
- **Board pack** — snapshot export  
- **Elevate** — invoices, payments, CAM, renewals, narrative  

---

## 7. Intelligence (Phase 5 + 7)

- **Portfolio Intelligence** — health score, KPIs, anomalies  
- **AI Assist** — triage suggestion + search  
- **Elevate** — predictive, pricing, NL ops, narrative, benchmarks  

---

## 8. Platform (admin / super admin)

- Org registration → Super Admin approval  
- Subscription billing & tiers  
- White-label colours/name/logo  
- Partner API explorer (`/openapi.json`)  
- Platform health / PWA install readiness  

---

## 9. Emergency broadcasts

Managers/admins publish high-priority announcements. Matching active alerts show as a top **Center Alert** banner in the operations dashboard.

---

## 10. Dark mode & PWA

- Dark mode: Navbar toggle.  
- PWA: install from the browser when offered; offline shell via service worker.  
- Offline banner when the browser reports offline.  

---

## 11. Logging out

User menu in the Navbar. Demo session clears from localStorage.

---

## 12. Important demo limitation

Without Supabase env vars, data lives **in your browser only**. It is not shared between devices or users. For a real multi-user pilot, complete [OWNER_SETUP.md](./OWNER_SETUP.md) and [PHASE2_SETUP.md](./PHASE2_SETUP.md).

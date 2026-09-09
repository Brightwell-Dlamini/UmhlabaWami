# User Guide — Umhlaba Wami

**Product status:** Phases 1–7 complete on the dual-mode demo layer. Live site: https://umhlaba-wami.vercel.app  
Until Supabase keys are configured, all users share **browser local** demo data (not a shared multi-user server).

---

## 1. Public Marketplace

Any visitor can:

- Browse available commercial units (retail, office, restaurant, kiosk, warehouse, etc.).
- Filter and open property detail (size, rent, features).
- Submit a **leasing enquiry** (feeds the leasing pipeline for staff).
- Submit a **List your property** lead for landlord onboarding.

No login required for browsing.

---

## 2. Logging In

1. Click **Login**.
2. Enter **Organisation Code** (e.g. `GAB-070826`) and **Username**.
3. Super Admin: org code `SUPER` / `ADMIN` or username `superadmin`.

**Demo mode:** password is not enforced.  
**Supabase mode** (when env keys are set): real email/password Auth applies — see [PHASE2_SETUP.md](./PHASE2_SETUP.md).

On success you land on the role-appropriate dashboard.

### Demo accounts (seed data)

| Role | Org code | Username |
|------|----------|----------|
| Super Admin | `SUPER` | `superadmin` |
| Org Admin | `GAB-070826` | `lindiwe.admin` |
| Property Manager | `GAB-070826` | `sipho.manager` |
| Tenant | `GAB-070826` | `nandi.tenant` |
| Maintenance | `GAB-070826` | `bheki.maintenance` |
| Finance | `GAB-070826` | `thandeka.finance` |

Use the one-click demo buttons on the login modal when available.

---

## 3. Role-specific experiences

### Tenant
- Overview of unit, tickets, lease  
- **Report Issue** wizard  
- My Tickets + timeline; confirm resolution / rate where enabled  
- Lease & documents, announcements, notifications  

### Property Manager
- **Centre Pulse** — live ops snapshot  
- **Elevate (P7)** — Phase 7 command centre  
- Tickets & SLAs, maintenance ops, preventive PM, SLA matrix  
- Units, tenants, leasing pipeline  
- Rent roll & board pack (as permitted)  
- Staff roster, vendors, announcements, messages  

### Maintenance technician
- Job queue and completion workflow  
- **Elevate (P7)** field tools (job status, etc.)  
- Schedule, preventive PM, messages  

### Finance
- **Rent Roll & Arrears**, deposits, board pack  
- **Elevate (P7)** commercial tools (payments, invoices, CAM)  
- Expenses, transactions, petty cash requests, documents  

### Organisation Admin
- Full operational + commercial surface  
- Staff & roles, branding/settings  
- **Elevate (P7)**, white-label, partner API explorer, platform health  

### Super Admin
- Org approvals, all organisations, subscription billing  
- Marketplace vacancy controls, user directory  
- **Elevate (P7)**, intelligence, compliance, partner API, platform health  

---

## 4. Creating a maintenance ticket

1. **Report Issue** / create ticket.  
2. Category, priority, title, description, location.  
3. Attach images if needed (Phase 7 photo evidence also available under Elevate).  
4. Submit — ticket number issued, SLA timers apply.  

Managers assign; technicians see jobs once assigned. Phase 7 field tab tracks on-site progress.

---

## 5. Centre operations (managers / admins)

- **Centre Pulse** — open work, SLA pressure, today’s focus  
- **SLA Matrix** — per-org response/resolution rules  
- **Preventive PM** — scheduled facility tasks  
- **Broadcast** — emergency/high-priority centre announcements (banner for logged-in ops users)  

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

- Dark mode: Navbar toggle (`dark` class on document root).  
- PWA: install from browser when offered; offline shell via service worker.  
- Offline banner appears when the browser reports offline.  

---

## 11. Logging out

User menu in the Navbar. Demo session clears from localStorage.

---

## 12. Important demo limitation

Without Supabase env vars, data lives **in your browser only**. It is not shared between devices or users. For a real multi-user pilot, complete [OWNER_SETUP.md](./OWNER_SETUP.md) and [PHASE2_SETUP.md](./PHASE2_SETUP.md).

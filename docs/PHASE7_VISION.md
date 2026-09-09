# Phase 7 — System-Wide Excellence (Vision)

**Codename:** Elevate  
**Status:** Planned / ideation  
**Goal:** Move from “complete platform” to “category-defining operating system” — the product managers, tenants, and landlords in Eswatini *cannot* do without.

Phases 1–6 delivered a coherent multi-role commercial property OS. Phase 7 is not another vertical feature dump. It is **system-wide depth**: speed, trust, money movement, field reality, and compounding intelligence.

---

## North-star outcomes

1. A centre manager runs the day from a phone without opening email.  
2. A landlord sees cash, risk, and occupancy in one board pack that writes itself.  
3. A tenant feels the building is responsive — issues resolved, receipts clear, communication calm.  
4. Integrators (banks, accounting, utilities, security) plug in without custom projects.  
5. Every sensitive action is explainable under POPIA and ordinary commercial dispute rules.

---

## Theme A — Production hardening (make demo = production)

| Idea | Why it matters | Rough shape |
|------|----------------|-------------|
| **True Supabase cutover** | Demo mode is a scaffold; real multi-tenant RLS is the product | Env-gated full CRUD, auth, storage for photos/PDFs |
| **Photo evidence on tickets** | Facilities disputes are visual | Camera capture on PWA, compressed upload, before/after gallery |
| **Real-time Centre Pulse** | Managers should not refresh | Supabase Realtime channels for tickets, announcements, SLA timers |
| **Notification channels** | In-app only is incomplete | Email (Resend/SendGrid) + optional SMS (local Eswatini gateway) for Emergency SLA |
| **Automated tests + CI** | Prevent regression as we deepen | Playwright smoke for login roles; vitest for services |

---

## Theme B — Money & commercial depth

| Idea | Why it matters | Rough shape |
|------|----------------|-------------|
| **Eswatini payment rails** | Rent is the business | MTN MoMo / bank EFT reconciliation; payment reference = unit + period |
| **Invoices & statements** | Finance needs artefacts | PDF invoices, tenant statement packs, aging letters |
| **Lease lifecycle 2.0** | Pipeline ends at “signed” today | Renewals, escalations (annual %), options to renew, break clauses, reminders 90/60/30 days |
| **CAM / recoveries** | Shopping centres live on recoveries | Common area charges, utilities allocation, monthly recovery invoices |
| **Sage / Xero bridge** | Accountants will not re-key | Export journals; optional two-way sync later |

---

## Theme C — Field operations excellence

| Idea | Why it matters | Rough shape |
|------|----------------|-------------|
| **Technician mobile workflow** | Bheki is not at a desk | Large-tap job queue, start/stop timer, parts used, signature on close |
| **QR codes on units** | Find the right shop in a mall | Unit QR → ticket create / history / lease summary |
| **Vendor scorecards** | Preferred vendor must be earned | On-time %, reopen rate, cost variance |
| **Shift handover notes** | Continuity across security/cleaning | Structured handover at shift end, visible on Centre Pulse |
| **Asset register** | Beyond tickets | HVAC, lifts, gensets with serials, warranty, next service |

---

## Theme D — Intelligence that compounds

| Idea | Why it matters | Rough shape |
|------|----------------|-------------|
| **Predictive maintenance** | Phase 5 anomalies → action | “Unit G-14: 3 leaks / 60 days → schedule pipe inspection” auto PM task |
| **Demand & vacancy pricing assist** | Marketplace should advise | Suggest list rent bands from comparable occupied units |
| **Natural-language ops** | Extend AI Assist | “Show me all Emergency tickets older than 1 hour” as a real filter action |
| **Board pack narrative** | Execs want prose | Auto ½-page narrative: occupancy, arrears, SLA, pipeline — export PDF |
| **Benchmarking (opt-in)** | Portfolio learning | Anonymised KPIs across centres (occupancy, SLA %) for landlords with multi-site |

---

## Theme E — Tenant & marketplace experience

| Idea | Why it matters | Rough shape |
|------|----------------|-------------|
| **Tenant app light** | Reduce WhatsApp chaos | Status of open tickets, pay rent link, documents, announcements |
| **Marketplace quality** | Public listings must convert | Floor plans, walkthrough video, enquiry → pipeline auto-create |
| **Self-serve lease docs** | Speed | Template lease generation (Eswatini commercial norms) with e-sign path |
| **Feedback loop** | Close the quality circle | Post-resolution CSAT (1–5) on tickets |

---

## Theme F — Platform & ecosystem

| Idea | Why it matters | Rough shape |
|------|----------------|-------------|
| **Live Partner API** | Phase 6 was a facade | Edge Functions implementing OpenAPI; API keys per org; rate limits |
| **Webhook delivery log** | Integrators debug | Signed payloads, retries, delivery history UI |
| **White-label domains** | Enterprise sales | `manage.gables.co.sz` via Vercel domains + branding |
| **Multi-property portfolio nav** | Landlords with many centres | Org switcher + cross-centre intelligence |
| **Role templates & SSO** | Enterprise IT | Azure/Google SSO later; invite links with expiry now |

---

## Theme G — Trust, compliance, resilience

| Idea | Why it matters | Rough shape |
|------|----------------|-------------|
| **POPIA data subject tools** | Legal reality | Export my data / request deletion workflows for tenant contacts |
| **Immutable audit export** | Disputes & insurers | Signed monthly audit archive to cold storage |
| **Disaster recovery drill** | Credibility | Documented backup restore from Supabase; RPO/RTO targets |
| **Access reviews** | Security hygiene | Quarterly “who has admin?” report for org admins |

---

## Suggested sequencing (if we build Phase 7 in waves)

### Wave 7.1 — Production spine (4–6 weeks)
Supabase hard cutover, photo evidence, realtime Pulse, email for critical SLA, CI smoke tests.

### Wave 7.2 — Cash & leases (4–6 weeks)
Invoices/statements, lease renewal engine, payment reference matching (even if manual reconcile first).

### Wave 7.3 — Field power (3–5 weeks)
Tech mobile workflow, QR units, asset register, CSAT.

### Wave 7.4 — Intelligence & API (ongoing)
Predictive PM, board pack narrative PDF, live Partner API + webhooks, white-label domain.

---

## What we should *not* do yet

- Native iOS/Android apps before PWA + field workflow is excellent.  
- Heavy ML models before clean event data (tickets, payments, PM) accumulates.  
- Expanding outside Eswatini before 3–5 live centres love the product.  
- Building a full accounting suite — integrate, don’t replace Sage.

---

## Success metrics (pick a few and instrument)

| Metric | Target direction |
|--------|------------------|
| Median Emergency first-response time | Down |
| % tickets with photo evidence | Up |
| Rent collection rate by day-5 | Up |
| Lease renewal rate vs prior year | Up |
| Tenant CSAT after resolution | ≥ 4.2 / 5 |
| Manager daily active use (mobile) | Up |
| Time to produce board pack | Minutes, not days |

---

## Decision prompt for the founder

When you are ready to implement Phase 7, choose a **primary bet**:

1. **Production spine** (trust the data)  
2. **Cash & leases** (trust the money)  
3. **Field power** (trust the technicians)  
4. **Intelligence & API** (trust the ecosystem)  

Or a blend of 7.1 + one commercial slice from 7.2.

This document is the idea bank. Implementation starts when you pick the wave.

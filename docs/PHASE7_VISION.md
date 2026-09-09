# Phase 7 — System-Wide Excellence (Vision)

**Codename:** Elevate  
**Status:** **Complete** (demo / dual-mode implementation) — see [PHASE7_COMPLETION.md](./PHASE7_COMPLETION.md)  
**Goal:** Move from “complete platform” to “category-defining operating system.”

Phases 1–6 delivered a coherent multi-role commercial property OS. Phase 7 adds **system-wide depth** across themes A–G.

---

## Implemented in product

Open **Elevate (P7)** in the sidebar after login. Tabs map to themes:

| Theme | Tabs / capabilities |
|-------|---------------------|
| **A** Production | Photos, Alerts (SMS/email outbox) |
| **B** Cash & leases | Payments, Invoices (+ Sage CSV), Renewals, CAM |
| **C** Field | Field jobs, Unit QR, Vendors, Handover, Assets |
| **D** Intelligence | Predictive, Pricing, NL ops, Narrative, Benchmarks |
| **E** Tenant quality | CSAT |
| **F** Platform | Webhooks (with Phase 6 Partner API / PWA / white-label) |
| **G** Trust | POPIA, Access review, DR checklist |

Service: `src/services/phase7Service.ts`  
UI: `src/components/dashboard/Phase7ElevateView.tsx`

---

## Production follow-ons

True Supabase cutover (storage, realtime), real Eswatini SMS/email, Edge Functions for Partner API, Playwright CI, and live centre pilots.

---

## Success metrics (instrument when live)

| Metric | Target direction |
|--------|------------------|
| Median Emergency first-response time | Down |
| % tickets with photo evidence | Up |
| Rent collection rate by day-5 | Up |
| Lease renewal rate | Up |
| Tenant CSAT after resolution | ≥ 4.2 / 5 |
| Time to produce board pack | Minutes |

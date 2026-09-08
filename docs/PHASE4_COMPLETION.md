# Phase 4 Completion Record — Commercial Engine & Marketplace

**Status:** Complete  
**Date:** September 2026  
**Live:** https://umhlaba-wami.vercel.app

---

## Goal

End-to-end leasing pipeline, rent roll and arrears depth, deposit workflows, board-pack exports, and organisation subscription billing — so commercial and finance teams can run the money side of the centre inside Umhlaba Wami.

---

## Delivered

| Capability | Implementation |
|------------|----------------|
| **Leasing pipeline** | Kanban: Enquiry → Viewing → Offer → Negotiation → Lease Draft → Signed / Lost; convert to lease + deposit hold |
| **Rent roll & arrears** | Expected vs collected, aging buckets (Current / 1-30 / 31-60 / 61-90 / 90+), record payment |
| **Deposit ledger** | Balances per tenant; partial/full refund; forfeit with finance transaction |
| **Board pack** | Occupancy, rent roll, arrears, tickets, pipeline weighted value; text export download |
| **Subscription billing** | Org tier, MRR, usage vs limits; Super Admin can change tier |
| **Service layer** | `src/services/commercialService.ts` |
| **Nav** | Manager/Admin/Finance/Super Admin sidebar entries |
| **README** | Updated for Phases 1–4 and live URL |

---

## How to verify

1. **Manager** `GAB-070826` / `sipho.manager` → **Leasing Pipeline** → Advance a deal to Signed (creates lease).  
2. **Finance** `thandeka.finance` → **Rent Roll & Arrears** → Record payment.  
3. **Deposits** → process partial refund.  
4. **Board Pack** → Export pack (downloads `.txt`).  
5. **Super Admin** → **Subscription Billing** → change an org tier.

---

## Definition of Done

| Criterion | Status |
|-----------|--------|
| Leasing path from prospect to signed lease | **Met** |
| Rent roll with arrears aging + payment capture | **Met** |
| Deposit hold / refund / forfeit | **Met** |
| Board-ready commercial snapshot + export | **Met** |
| Org subscription metering & tier change | **Met** |
| README & roadmap updated | **Met** |

---

## Next

**Phase 5 — Intelligence & Scale:** deeper analytics, AI-assisted triage, granular permissions, compliance trails.

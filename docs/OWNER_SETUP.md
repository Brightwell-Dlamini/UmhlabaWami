# Owner Setup Checklist — What Only You Can Do

**Purpose:** Everything required to take Umhlaba Wami from **demo / dual-mode** to a **real multi-user production system**. These items need your accounts, money, legal review, or physical/ops work. I can implement code and docs; I cannot create your vendor accounts, hold your secrets, or operate your centres.

**Live demo today:** https://umhlaba-wami.vercel.app (browser `localStorage` demo mode until you add backend keys)

---

## 1. Accounts & access (create these yourself)

| Item | Why | Where |
|------|-----|--------|
| **GitHub** repo admin access | Deployments, collaborators, branch protection | Already connected for this project |
| **Vercel** project access | Production hosting, env vars, domains | Project linked to `UmhlabaWami` → main |
| **Supabase** project | Real Auth, Postgres + RLS, Storage, Realtime | [supabase.com](https://supabase.com) — prefer a region close to ZA/SZ |
| **Domain name** (optional) | `umhlabawami.sz` or `manage.yourbrand.sz` | Registrar + DNS → Vercel |
| **Transactional email** | Password resets, SLA alerts, digests | Resend, SendGrid, Postmark, or similar |
| **SMS provider** (optional) | Emergency SLA texts to staff | Local/regional SMS gateway that supports +268 |
| **MTN MoMo / bank merchant** | Real rent collection | MTN Business / your bank’s merchant or API team |
| **Error monitoring** (optional) | Production crash visibility | Sentry, or Vercel monitoring |
| **E-signature vendor** (optional) | Legally reliable lease signing | DocuSign, SignRequest, or local counsel-approved tool |

---

## 2. Secrets & environment variables (never commit these)

Copy from `.env.example` → `.env.local` (local) and **Vercel → Project → Settings → Environment Variables** (production).

| Variable | Who sets it | Purpose |
|----------|-------------|--------|
| `VITE_SUPABASE_URL` | You | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | You | Public anon key (RLS-protected) |
| `VITE_FORCE_DEMO_MODE` | You (optional) | Force localStorage demo even if Supabase is configured |
| Supabase **service role** key | You | **Server/Edge only** — never in frontend |
| Email provider API key | You | Transactional email |
| SMS provider API key | You | Emergency/ops SMS |
| MoMo / payment API keys | You | Real collections |
| Sentry DSN (or similar) | You | Error monitoring |
| Partner API signing secrets | You | Webhook HMAC / API keys per org |

Until `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set on Vercel, production stays in **demo mode**.

---

## 3. Supabase setup (your hands on the console)

Follow **[PHASE2_SETUP.md](./PHASE2_SETUP.md)** in full. Checklist:

- [ ] Create Supabase project (region near ZA/SZ if available)
- [ ] Run `public/supabase-schema.sql` in SQL Editor
- [ ] **Extend schema** for Phase 3–7 entities still only in app memory/localStorage (pipeline deals, deposits, SLA matrices, preventive tasks, assets, invoices, payments, CSAT, webhook logs, POPIA requests, permission overrides, branding overrides) — schema file today is the **core** model; app has grown past it
- [ ] Create Storage buckets: `ticket-attachments`, `property-images`, `lease-documents`, `org-logos`
- [ ] Tighten Storage policies by organisation prefix
- [ ] Create Auth users whose **emails match** `public.users.email` exactly
- [ ] Insert/seed `organizations` + `users` rows for your real pilot centre
- [ ] Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` on Vercel (Production + Preview as needed)
- [ ] Redeploy and verify password login + RLS isolation between two orgs
- [ ] Keep **service role** key only in Edge Functions / server env — never in `VITE_*`

---

## 4. Vercel / domain (your hands)

- [ ] Confirm project is linked to GitHub `UmhlabaWami` / `main`
- [ ] Set env vars (above)
- [ ] Optional: add custom domain + DNS
- [ ] Optional: custom domains per white-label client
- [ ] Confirm SPA fallback (`vercel.json` rewrites) still serves `index.html`
- [ ] Optional: protect preview deployments

---

## 5. Payments (your contracts & KYC)

I cannot open merchant accounts or hold settlement funds.

- [ ] Register **MTN MoMo Business** (or chosen wallet) for collections
- [ ] Register **bank merchant / EFT** receiving account and reconciliation process
- [ ] Decide settlement entity (your company vs each landlord)
- [ ] Define payment reference standard (already suggested: unit + period)
- [ ] Legal terms for platform fees vs landlord collections
- [ ] PCI scope decision if cards are ever accepted directly

---

## 6. Messaging providers (your accounts)

- [ ] Transactional email provider + verified sending domain/DNS (SPF/DKIM/DMARC)
- [ ] SMS provider that can deliver to **+268** numbers
- [ ] Templates for: org approval, password reset, emergency SLA, rent reminder, weekly digest

---

## 7. Legal, compliance, commercial (humans only)

- [ ] Company registration / tax status for the SaaS entity
- [ ] Terms of Service, Privacy Policy, POPIA-aligned processing terms
- [ ] Data retention & deletion policy
- [ ] Commercial lease templates reviewed by **Eswatini counsel** before e-sign is trusted
- [ ] E-signature vendor selection and certificate rules
- [ ] Contracts with pilot landlords (SLA, data ownership, fees)
- [ ] Insurance / liability for ops recommendations (optional but wise)

---

## 8. Pilot operations (your centres)

- [ ] Choose 1 pilot shopping centre
- [ ] Real org profile, units, tenants, leases entered (or migrated)
- [ ] Print and affix **unit QR** stickers
- [ ] Train manager, tech, finance on Elevate + Centre Pulse
- [ ] Define who receives Emergency SMS
- [ ] Agree board-pack cadence (weekly/monthly)
- [ ] Remove or isolate demo seed data from production

---

## 9. What I cannot do for you

| I can | I cannot |
|-------|----------|
| Write code, SQL, docs, UI | Create your Supabase/Vercel/email/SMS/MoMo accounts |
| Design API contracts | Hold or rotate your live secrets |
| Simulate payments & webhooks | Settle real money or sign merchant agreements |
| Draft POPIA UX | Act as your lawyer or DPO |
| Draft lease UX | Give binding Eswatini legal advice or execute leases |
| Deploy via connected GitHub/Vercel | Physically train staff or sticker QR codes on doors |

---

## Minimum path to a real pilot

1. Supabase project + schema (+ Phase 7 table extensions)  
2. Auth users matching `public.users` emails  
3. Vercel env vars + redeploy  
4. One real centre’s units/tenants/leases  
5. Email provider for alerts  
6. Legal basics (privacy + terms)  
7. Train one manager + one technician  

Everything else can follow from real usage.

# Deployment & Production Notes — Umhlaba Wami

## 1. Current state

- **GitHub:** `Brightwell-Dlamini/UmhlabaWami`  
- **Vercel:** https://umhlaba-wami.vercel.app (SPA; `vercel.json` rewrites)  
- **Default mode:** Demo — browser `localStorage`, not shared multi-user production  
- **Phases 1–7:** Implemented in the SPA; Phase 2 Supabase activates when env keys are set  

## 2. Recommended production architecture

1. **Frontend:** Vercel (or other static host) from Vite `dist/`  
2. **Backend:** Supabase — Postgres + RLS, Auth, Storage, Realtime  
3. **Edge/API:** Supabase Edge Functions implementing `public/openapi.json`  
4. **Email / SMS:** Provider of your choice (+268 capable for SMS)  
5. **Payments:** MTN MoMo Business / bank EFT (owner merchant accounts)  
6. **Monitoring:** Sentry (or similar) + Supabase/Vercel dashboards  

Owner action list: **[OWNER_SETUP.md](./OWNER_SETUP.md)**  
Supabase steps: **[PHASE2_SETUP.md](./PHASE2_SETUP.md)**

## 3. Build & deploy

```bash
npm install
npm run build
# output: dist/
```

Push to `main` deploys via the linked Vercel Git project. SPA fallback must serve `index.html` for client routes.

## 4. Environment variables

See `.env.example`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FORCE_DEMO_MODE` (optional)

Plus **server-only** secrets for email, SMS, payments, service role (never `VITE_*`).

## 5. Security checklist before go-live

- [ ] Real Auth passwords / Supabase Auth  
- [ ] RLS on every table + Storage policies  
- [ ] Schema extended for Phase 3–7 local-only entities  
- [ ] HTTPS only; CSP and rate limits  
- [ ] Audit log retention server-side  
- [ ] Backups + restore drill  
- [ ] No demo seed in production  

## 6. PWA

- `public/manifest.webmanifest`, `public/sw.js`, `public/icons/*`  
- Registered from `src/main.tsx`  
- Confirm installability in Chrome/Edge Application panel after deploy  

## 7. Monitoring

- Frontend errors (e.g. Sentry)  
- Supabase auth/DB metrics  
- Business events: SLA breaches, org approvals, payment matches  

---

*Updated for Phases 1–7.*

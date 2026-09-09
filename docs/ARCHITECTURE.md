# Architecture Overview — Umhlaba Wami

## 1. High-Level Architecture

Umhlaba Wami is a **React 19 + TypeScript + Vite SPA** with layered services and a **dual-mode** data/auth backend.

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React 19 SPA / PWA)             │
├──────────────────────┬──────────────────────────────────────┤
│  Marketplace (public)│  Role dashboards + Elevate (P7) hub  │
├──────────────────────┴──────────────────────────────────────┤
│  App.tsx — view mode, sidebar tabs, modals, theme, toasts     │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ AuthService │ DbService   │ opsService  │ commercialService │
│ dual-mode   │ dual-mode   │ Phase 3     │ Phase 4           │
├─────────────┴─────────────┴─────────────┴───────────────────┤
│ intelligenceService (P5) · brandingService · partnerApi (P6) │
│ phase7Service (P7 Elevate)                                    │
├─────────────────────────────────────────────────────────────┤
│ Domain types: src/types/index.ts                              │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
     Demo mode (default)              Supabase mode
     localStorage + seed              Postgres+RLS, Auth,
                                      Storage, Realtime (opt.)
```

Mode selection: `src/lib/supabase.ts` — if `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set (and not forced demo), Auth/DB can use Supabase helpers. UI still primarily driven by in-memory `db` until fully migrated view-by-view.

## 2. Application entry & routing

- `index.html` — SEO, PWA manifest link, theme-color, icons  
- `src/main.tsx` — React root, **ErrorBoundary**, service worker registration  
- `src/App.tsx` — marketplace vs dashboard, role tab content, modals, dark mode, offline banner, branding apply  

Navigation is **state-driven** (no React Router). Deep-linking may be added later.

## 3. Authentication & authorisation

- **Demo:** org code + username; password not enforced  
- **Supabase mode:** org code + username resolved to email/password Auth  
- Roles: `tenant` | `property_manager` | `maintenance` | `finance` | `admin` | `super_admin`  
- **Phase 5:** granular `PermissionKey` catalog + per-user overrides (`intelligenceService`)  
- Org status must be Active for normal login; Super Admin is platform-scoped  

## 4. Data layer

- **DbService** — seed, CRUD helpers, audit log, pub/sub, localStorage key `umhlaba_wami_db_v2`  
- **opsService** — SLA matrix, escalation, preventive maintenance, Centre Pulse inputs  
- **commercialService** — pipeline, rent roll, deposits, board pack, subscriptions  
- **intelligenceService** — KPIs, anomalies, triage, NL search, permissions, audit helpers  
- **brandingService** — white-label CSS variables  
- **partnerApi** — OpenAPI-shaped partner facade  
- **phase7Service** — Elevate A–G extensions  
- **Schema:** `public/supabase-schema.sql` (core); app local collections for P3–P7 extensions still need schema expansion before full remote mode  

## 5. Component organisation

| Folder | Responsibility |
|--------|----------------|
| `components/auth` | Login, org registration |
| `components/layout` | Navbar, Sidebar, MobileBottomNav, Footer |
| `components/marketplace` | Public listings, enquiry, leads |
| `components/dashboard` | Role portals, Pulse, commercial, intelligence, Elevate |
| `components/management` | Units, leases |
| `components/tickets` | Create wizard, detail modal |
| `components/system` | ErrorBoundary, OfflineBanner |

## 6. UI / UX

- Tailwind CSS 4, dark mode, Lucide icons  
- Mobile bottom nav for authenticated users  
- Emergency banner for active centre alerts  
- PWA install shell (`manifest.webmanifest`, `sw.js`)  
- Brand CSS variables `--brand-primary`, `--brand-accent`  

## 7. Security notes

- **Demo mode:** no real password enforcement; client-side data only — not multi-user production  
- **Supabase mode:** RLS, Auth, server-side audit, storage policies required before go-live  
- Never expose service role key in `VITE_*`  

---

*Updated for Phases 1–7.*

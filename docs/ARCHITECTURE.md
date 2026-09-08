# Architecture Overview — Umhlaba Wami

## 1. High-Level Architecture

Umhlaba Wami is structured as a **single-page application (SPA)** with a clear separation between:

- **Presentation layer** (React components organised by domain)
- **Application services** (AuthService, DbService)
- **Domain model** (TypeScript types in `src/types`)
- **Future persistence layer** (Supabase PostgreSQL schema + RLS)

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React 19 SPA)                   │
├──────────────────────┬──────────────────────────────────────┤
│  Marketplace Views   │  Role-based Dashboard Views          │
│  (public)            │  (authenticated)                     │
├──────────────────────┴──────────────────────────────────────┤
│  App.tsx — View routing, modal orchestration, toast, theme  │
├──────────────────────┬──────────────────────────────────────┤
│  AuthService         │  DbService (in-memory + localStorage)│
│  - login / logout    │  - seed data                         │
│  - permissions       │  - CRUD helpers                      │
│  - session restore   │  - audit logging                     │
│                      │  - pub/sub for UI reactivity         │
├──────────────────────┴──────────────────────────────────────┤
│  Domain Types (User, Organization, Shop, Ticket, Lease …)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼  (Phase 2 target)
┌─────────────────────────────────────────────────────────────┐
│  Supabase                                                    │
│  - PostgreSQL + RLS                                          │
│  - Auth                                                      │
│  - Storage (attachments, images)                             │
│  - Realtime (optional)                                       │
└─────────────────────────────────────────────────────────────┘
```

This architecture is deliberately layered so that Phase 2 can replace the client-side data and auth implementations without a wholesale rewrite of the UI.

## 2. Application Entry & Routing

- `index.html` mounts the React root and sets SEO meta tags.
- `src/main.tsx` bootstraps React.
- `src/App.tsx` is the central orchestrator:
  - Subscribes to AuthService and DbService changes.
  - Switches between `marketplace` and `dashboard` view modes.
  - Renders the appropriate sidebar tab content based on role and `sidebarActiveTab`.
  - Manages global modals (login, register, ticket creation, property detail, broadcast, etc.).
  - Supports dark mode via a CSS class on `document.documentElement`.

There is currently **no React Router** dependency; navigation is state-driven. This may be revisited in later phases if deep-linking and shareable URLs become important.

## 3. Authentication & Authorisation

### AuthService (`src/services/auth.ts`)

- Session is stored under the key `umhlaba_wami_current_user_id` in `localStorage`.
- Login accepts **Organisation Code** + **Username** (password parameter is present but not enforced in the demo layer).
- Special super-admin path: username `superadmin` or org codes `SUPER` / `ADMIN`.
- Organisation status is validated (`Pending Approval`, `Suspended`, `Rejected` block login).
- User status must be `Active`.
- Role-based permission helpers are centralised and should remain the single source of truth for UI gating.

### Roles

| Role | Typical Scope |
|------|---------------|
| `tenant` | Own shop, tickets, lease, documents |
| `property_manager` | Assigned centre/property operations |
| `maintenance` | Assigned tickets / jobs |
| `finance` | Rent, expenses, requests |
| `admin` | Full organisation control |
| `super_admin` | Platform-wide: org approval, subscriptions, audit |

Phase 2 will replace the current session mechanism with proper server-backed authentication while preserving the organisation-code login experience where it adds value.

## 4. Data Layer

### DbService (`src/services/db.ts`) — Phase 1

- Holds all domain collections.
- Seeds realistic Eswatini demo data on first load.
- Persists state to `localStorage` under `umhlaba_wami_db_v2`.
- Exposes a publish-subscribe API so React components re-render on mutations.
- Provides helper methods for common operations (ticket lifecycle, audit logging, etc.).

### Production Schema

`public/supabase-schema.sql` defines the target PostgreSQL tables and a starter set of RLS policies. The TypeScript interfaces in `src/types/index.ts` are deliberately aligned with this schema so that the transition in Phase 2 is primarily an implementation swap rather than a model redesign.

## 5. Component Organisation

| Folder | Responsibility |
|--------|----------------|
| `components/auth` | Login and organisation registration modals |
| `components/layout` | Navbar, Sidebar (role-aware), Footer |
| `components/marketplace` | Public marketplace, property cards, enquiry & lead modals |
| `components/dashboard` | All role dashboards and operational lists |
| `components/management` | Units directory, lease & SLA management |
| `components/tickets` | Multi-step ticket creation wizard and detailed ticket modal |

## 6. UI / UX Patterns

- Tailwind CSS 4 utility-first styling with dark mode support.
- Lucide icons for consistent iconography.
- Motion library available for animations.
- Toast notifications for user feedback.
- Emergency centre-wide alert banner when active announcements match emergency keywords.
- Responsive layout: sidebar hidden on smaller viewports; content adapts.

## 7. Extensibility Points (Aligned with Roadmap)

1. **Phase 2** — Replace DbService and AuthService internals with Supabase client while keeping the same TypeScript interfaces and permission helpers.
2. **Phase 3+** — Deepen ticket, SLA, staff, and vendor workflows inside the existing component structure.
3. **Phase 4+** — Extend leasing, payments, and marketplace growth features.
4. **Phase 5** — Introduce analytics services and GenAI-assisted features (capability already declared in `metadata.json`).
5. **Phase 6** — Public API, webhooks, white-label theming, and native/PWA mobile experiences.

## 8. Security Notes

### Phase 1 (Current)
- No password hashing or server-side validation.
- All data is client-side; suitable only for demonstration and local development.

### From Phase 2 Onward
- Multi-tenant isolation via Row-Level Security.
- Proper authentication and session management.
- Secure storage for files and documents.
- Server-side audit logging of sensitive actions.
- Progressive hardening (rate limiting, CSP, backups, etc.) as the product approaches production use.

---

*This document is updated as the architecture evolves through the phases described in `ROADMAP.md`.*

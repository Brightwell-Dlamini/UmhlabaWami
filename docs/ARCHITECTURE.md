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
                              ▼  (production target)
┌─────────────────────────────────────────────────────────────┐
│  Supabase                                                    │
│  - PostgreSQL + RLS                                          │
│  - Auth                                                      │
│  - Storage (attachments, images)                             │
│  - Realtime (optional)                                       │
└─────────────────────────────────────────────────────────────┘
```

## 2. Application Entry & Routing

- `index.html` mounts the React root and sets SEO meta tags.
- `src/main.tsx` bootstraps React.
- `src/App.tsx` is the central orchestrator:
  - Subscribes to AuthService and DbService changes.
  - Switches between `marketplace` and `dashboard` view modes.
  - Renders the appropriate sidebar tab content based on role and `sidebarActiveTab`.
  - Manages global modals (login, register, ticket creation, property detail, broadcast, etc.).
  - Supports dark mode via a CSS class on `document.documentElement`.

There is **no React Router** dependency; navigation is state-driven inside `App.tsx` and the layout components.

## 3. Authentication & Authorisation

### AuthService (`src/services/auth.ts`)

- Session is stored under the key `umhlaba_wami_current_user_id` in `localStorage`.
- Login accepts **Organisation Code** + **Username** (password parameter is present but not enforced in the demo layer).
- Special super-admin path: username `superadmin` or org codes `SUPER` / `ADMIN`.
- Organisation status is validated (`Pending Approval`, `Suspended`, `Rejected` block login).
- User status must be `Active`.
- Role-based permission helpers:
  - `canCreateTicket`
  - `canAssignTicket`
  - `canManageProperties`
  - `canManageUsers`
  - `canAccessFinancials`
  - `canApproveOrganizations`
  - `canManageSubscriptions`
  - `canManagePublicListings`

### Roles

| Role | Typical Scope |
|------|---------------|
| `tenant` | Own shop, tickets, lease, documents |
| `property_manager` | Assigned centre/property operations |
| `maintenance` | Assigned tickets / jobs |
| `finance` | Rent, expenses, requests |
| `admin` | Full organisation control |
| `super_admin` | Platform-wide: org approval, subscriptions, audit |

## 4. Data Layer

### DbService (`src/services/db.ts`)

- Holds all domain collections (organisations, users, shopping centres, properties, shops, tenants, leases, tickets, finance, etc.).
- Seeds realistic Eswatini demo data on first load.
- Persists the entire state to `localStorage` under `umhlaba_wami_db_v2`.
- Exposes a simple publish-subscribe API so React components re-render on mutations.
- Provides helper methods for common operations (ticket lifecycle, audit logging, etc.).

### Production Schema

`public/supabase-schema.sql` defines the target PostgreSQL tables and a starter set of RLS policies. The TypeScript interfaces in `src/types/index.ts` are deliberately aligned with this schema.

## 5. Component Organisation

| Folder | Responsibility |
|--------|----------------|
| `components/auth` | Login and organisation registration modals |
| `components/layout` | Navbar, Sidebar (role-aware), Footer |
| `components/marketplace` | Public marketplace, property cards, enquiry & lead modals |
| `components/dashboard` | All role dashboards and operational lists (tickets, tenants, finance, etc.) |
| `components/management` | Units directory, lease & SLA management |
| `components/tickets` | Multi-step ticket creation wizard and detailed ticket modal |

## 6. UI / UX Patterns

- Tailwind CSS 4 utility-first styling with dark mode support.
- Lucide icons for consistent iconography.
- Motion library available for animations.
- Toast notifications for user feedback.
- Emergency centre-wide alert banner when active announcements match emergency keywords.
- Responsive layout: sidebar hidden on smaller viewports; content adapts.

## 7. Extensibility Points

1. **Replace DbService** with a Supabase client wrapper while keeping the same TypeScript interfaces.
2. **Enhance AuthService** to use Supabase Auth (email / magic link / OAuth) while preserving the organisation-code login UX if required.
3. **Add Realtime** subscriptions for tickets and announcements.
4. **Integrate GenAI** (already declared in `metadata.json`) for ticket classification, SLA risk prediction, or natural-language reporting.
5. **Export adapters** for finance systems (Sage, QuickBooks) from the Finance Portal.

## 8. Security Notes (Current Demo)

- No password hashing or server-side validation.
- All data is client-side; suitable only for demonstration and local development.
- Production deployment **must** move to Supabase (or equivalent) with RLS, authenticated storage, and proper session management.

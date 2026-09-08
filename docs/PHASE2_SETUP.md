# Phase 2 Setup Guide — Supabase Backend

Phase 2 introduces a **dual-mode** architecture:

| Mode | When | Behaviour |
|------|------|-----------|
| **Demo** (default) | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` not set | Phase 1 localStorage data + demo login |
| **Supabase** | Both env vars set | Real Auth, PostgreSQL + RLS, Storage |

The live Vercel deployment continues to run in **demo mode** until you add Supabase credentials.

---

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a project (region closest to Eswatini / South Africa if available).
2. Open **Project Settings → API** and copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

## 2. Apply the schema

1. Open **SQL Editor** in Supabase.
2. Paste and run the full contents of `public/supabase-schema.sql`.
3. Confirm tables exist under **Table Editor**.

## 3. Create storage buckets

In **Storage**, create public or authenticated buckets:

- `ticket-attachments`
- `property-images`
- `lease-documents`
- `org-logos`

Add policies that scope objects by organisation folder prefix as needed.

## 4. Provision Auth users

For each operational user in `public.users`:

1. **Authentication → Users → Add user** with the same **email** as in `public.users`.
2. Set a known password (share securely with the demo/operator).
3. Ensure the `users.email` column matches the Auth user email exactly (RLS helpers use `auth.jwt() → email`).

Recommended first accounts:

| Role | Email (example) | Notes |
|------|-----------------|-------|
| Super Admin | admin@umhlabawami.sz | `role = super_admin`, `organization_id` null |
| Org Admin | lindiwe@ezulwiniproperties.sz | Linked to an Active organisation |

You can insert matching rows into `organizations` and `users` via SQL or Table Editor.

## 5. Configure environment variables

### Local

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
npm install
npm run dev
```

### Vercel

1. Project **umhlaba-wami** → Settings → Environment Variables
2. Add for Production (and Preview if desired):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redeploy (push to `main` or Redeploy from the dashboard)

## 6. Verify

1. Open the app — login should enforce real passwords when Supabase mode is active.
2. Register an organisation → row appears with `Pending Approval`.
3. Super Admin approves → status becomes `Active`.
4. Two different organisations must not see each other’s tickets (RLS).

## 7. Rollback to demo mode

Remove the env vars (or set `VITE_FORCE_DEMO_MODE=true`) and redeploy. The UI continues to work on the Phase 1 localStorage layer.

---

## Architecture notes

- `src/lib/supabase.ts` — client + mode detection
- `src/services/supabaseAuth.ts` — org-code + username → email password Auth
- `src/services/supabaseDb.ts` — remote CRUD helpers
- `src/services/auth.ts` — dual-mode `login` / `loginAsync` / session restore
- `public/supabase-schema.sql` — tables, helper functions, comprehensive RLS

UI components still primarily read from the in-memory `db` service in demo mode. Full UI migration to always call `supabaseDb` helpers is incremental and can proceed view-by-view without breaking demo mode.

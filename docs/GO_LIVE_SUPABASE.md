# Go-Live with Supabase — Guided Cutover

You and the product are switching from **localStorage / mock seed** to a **real Postgres + Auth backend**.

Follow these steps **in order**. Tick each box as you finish it.

**Live app:** https://umhlaba-wami.vercel.app  
**Repo SQL files:** `public/supabase-schema.sql`, `public/supabase-schema-phase3-7.sql`, `public/seed-demo-data.sql`, `public/supabase-auth-bridge.sql`

---

## Step 0 — What you need open

1. [supabase.com](https://supabase.com) (logged in)  
2. GitHub repo `Brightwell-Dlamini/UmhlabaWami`  
3. Vercel project for `umhlaba-wami`  
4. This checklist

I cannot create the Supabase project or Auth users for you — those need your account. Everything else (SQL, app code, login bridge) is in the repo.

---

## Step 1 — Create the Supabase project

1. Go to https://supabase.com/dashboard → **New project**  
2. Name: e.g. `umhlaba-wami`  
3. Set a strong **database password** (save it somewhere safe)  
4. Region: closest to **South Africa / Eswatini** if listed (else nearest EU/Africa)  
5. Wait until the project is **healthy**

---

## Step 2 — Copy API keys

In Supabase: **Project Settings → API**

Copy:

| Value | Env var name |
|-------|----------------|
| Project URL | `VITE_SUPABASE_URL` |
| `anon` `public` key | `VITE_SUPABASE_ANON_KEY` |

Do **not** put the `service_role` key in the frontend or Vercel `VITE_*` vars.

---

## Step 3 — Run SQL scripts (SQL Editor)

Open **SQL Editor → New query**. Run **one file at a time**, in this order:

### 3a. Core schema
Paste entire contents of:

`public/supabase-schema.sql` → **Run**

### 3b. Phase 3–7 tables
Paste entire contents of:

`public/supabase-schema-phase3-7.sql` → **Run**

### 3c. Demo seed (orgs, users, units, sample ticket)
Paste entire contents of:

`public/seed-demo-data.sql` → **Run**

### 3d. Login bridge (required for org-code login under RLS)
Paste entire contents of:

`public/supabase-auth-bridge.sql` → **Run**

### 3e. Quick check

```sql
SELECT organization_code, status FROM organizations;
SELECT username, email, role FROM users;
SELECT proname FROM pg_proc WHERE proname = 'resolve_login';
```

You should see `GAB-070826`, `SWZ-060926`, `RIV-010926`, the six demo users, and `resolve_login`.

---

## Step 4 — Create Auth users (must match emails)

In Supabase: **Authentication → Users → Add user**

Create **one Auth user per row** below.  
**Email must match exactly.** Use the same password for all during testing (e.g. `UmhlabaDemo2026!`).

| Role | Org code (app login) | Username (app login) | Auth email | Suggested password |
|------|----------------------|----------------------|------------|--------------------|
| Super Admin | `SUPER` | `superadmin` | `admin@umhlabawami.sz` | `UmhlabaDemo2026!` |
| Org Admin | `GAB-070826` | `lindiwe.admin` | `lindiwe@ezulwiniproperties.sz` | `UmhlabaDemo2026!` |
| Property Manager | `GAB-070826` | `sipho.manager` | `sipho@ezulwiniproperties.sz` | `UmhlabaDemo2026!` |
| Tenant | `GAB-070826` | `nandi.tenant` | `nandi@swaziartisancrafts.sz` | `UmhlabaDemo2026!` |
| Maintenance | `GAB-070826` | `bheki.maintenance` | `bheki@ezulwiniproperties.sz` | `UmhlabaDemo2026!` |
| Finance | `GAB-070826` | `thandeka.finance` | `thandeka@ezulwiniproperties.sz` | `UmhlabaDemo2026!` |

Tips:

- Disable “auto confirm” only if you want email verification; for testing, **auto-confirm** is easier  
- If Auth rejects `.sz` emails, enable any email in Auth settings or use confirmed custom SMTP later  

---

## Step 5 — Storage buckets (optional for first login test)

**Storage → New bucket** (can be private; public OK for demos):

- `ticket-attachments`  
- `property-images`  
- `lease-documents`  
- `org-logos`  

You can skip buckets until after the first successful password login.

---

## Step 6 — Wire environment variables

### Local

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
# Do NOT set VITE_FORCE_DEMO_MODE while testing real backend
```

```bash
npm install
npm run dev
```

### Vercel (production site)

1. Vercel → project **umhlaba-wami** → **Settings → Environment Variables**  
2. Add for **Production** (and Preview if you want):
   - `VITE_SUPABASE_URL`  
   - `VITE_SUPABASE_ANON_KEY`  
3. Remove or set `VITE_FORCE_DEMO_MODE` to `false` if present  
4. **Redeploy** (Deployments → … → Redeploy, or push a commit)

---

## Step 7 — Test login (real backend)

1. Open the app (local or https://umhlaba-wami.vercel.app)  
2. Hard refresh (`Ctrl/Cmd+Shift+R`)  
3. **Sign In** with:
   - Org: `GAB-070826`  
   - Username: `sipho.manager`  
   - Password: the Auth password you set (e.g. `UmhlabaDemo2026!`)  
4. You should land on **Centre Pulse**  

Repeat for tenant / finance / superadmin.

### If login fails

| Error | Likely cause |
|-------|----------------|
| `Login resolver failed` / function not found | Step 3d not run |
| User not found | Seed (3c) not run or wrong org code |
| Invalid login credentials | Auth user missing or wrong password / email mismatch |
| Auth succeeded but profile not found | `public.users.email` ≠ Auth email |
| Still seems like demo | Env vars missing on that host; or `VITE_FORCE_DEMO_MODE=true` |

---

## Step 8 — What “real backend” means today

After cutover:

| Layer | Behaviour |
|-------|-----------|
| **Auth** | Real Supabase Auth sessions + passwords |
| **Core data** | Hydrated from Postgres after login (orgs, users, centres, shops, tickets, …) |
| **RLS** | Users only see their organisation (Super Admin sees all) |
| **Some Phase 3–7 UI extras** | May still use local/demo services until those tables are fully wired view-by-view |

That is expected. First milestone is: **password login + data from Postgres + role dashboards**. Deeper write-paths (every Elevate action hitting Postgres) are the next engineering slice after you confirm login works.

---

## Step 9 — Tell me when you’re ready

Reply with which step you’re on, for example:

- “Step 1 done — here is my project region”  
- “SQL all ran — Auth users created”  
- “Env vars on Vercel — login still fails with: …” (paste exact error)

I’ll walk the next step with you until we can log in as any role against the real backend.

---

## Rollback to pure demo

Vercel / `.env.local`:

```env
VITE_FORCE_DEMO_MODE=true
```

Redeploy. App returns to localStorage seed behaviour.

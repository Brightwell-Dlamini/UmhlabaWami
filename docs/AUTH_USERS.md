# Auth users ↔ public.users

## Why Auth users did not show in `public.users`

Supabase **Authentication** stores identities in **`auth.users`**.  
The app reads roles/orgs from **`public.users`**.  
Those are different tables. Creating someone only in Auth never created an app profile until we added a **database trigger**.

## Fix (run once in SQL Editor)

1. `public/auth-users-sync.sql` — trigger + INSERT/DELETE policies  
2. Optional: `public/cleanup-seed-users.sql` — remove seeded demo staff  

## Recommended workflow (your plan)

### A. Super Admin only via Auth

1. Run **auth-users-sync.sql**  
2. Run **cleanup-seed-users.sql** (wipes seed staff)  
3. **Authentication → Users → Add user**  
   - Email: e.g. `admin@yourdomain.sz`  
   - Password: set and save  
   - **Auto Confirm User**: enabled  
   - **User Metadata** (important):

```json
{
  "username": "superadmin",
  "name": "Platform Super Admin",
  "role": "super_admin"
}
```

4. Open **Table Editor → users** — you should see a row with the same UUID as Auth  
5. App login: org code `SUPER` (or `ADMIN`) + username `superadmin` + password  

### B. Everyone else via UI + Auth

1. Log in as super admin  
2. **Staff & Roles** → Add user (writes **`public.users`**)  
3. In Supabase Auth, **Add user** with the **exact same email** and metadata:

```json
{
  "username": "sipho.manager",
  "name": "Sipho Dlamini",
  "role": "property_manager",
  "organization_id": "<uuid of GAB org from organizations table>"
}
```

4. Trigger **links** Auth id → existing `public.users` row by email (`ON CONFLICT (email)`)

Alternatively create Auth first with metadata; trigger creates `public.users` automatically.

## Metadata fields the trigger understands

| Key | Purpose |
|-----|--------|
| `username` | Login username (org-code login) |
| `name` | Display name |
| `role` | `super_admin` \| `admin` \| `property_manager` \| `maintenance` \| `finance` \| `tenant` |
| `organization_id` | UUID of org (omit for super_admin) |
| `phone` | Optional |

## App login (Supabase mode)

Uses org code + username/email + **password** against Auth, then loads `public.users` by email.

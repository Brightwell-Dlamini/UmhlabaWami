# Start clean: Super Admin only

You asked to seed **only** the Super Admin and create everything else from the product UI.

## 1. Database scripts (SQL Editor)

Run in order:

1. `public/supabase-schema.sql`
2. `public/supabase-schema-phase3-7.sql`
3. `public/supabase-auth-bridge.sql`
4. `public/supabase-public-marketplace.sql`
5. **`public/seed-super-admin-only.sql`** ← not the full demo seed

## 2. Auth user (Dashboard → Authentication → Users)

| Field | Value |
|-------|--------|
| Email | `admin@umhlabawami.sz` |
| Password | **your choice** (remember it) |
| Auto-confirm | Yes |

## 3. Sign in on the app

| Field | Value |
|-------|--------|
| Organisation code | `SUPER` |
| Username | `superadmin` |
| Password | the password you set above |

## 4. Build the world from the UI

1. **Public site** → Register organisation (landlord applies).  
2. **Super Admin** → Approvals → approve → note the organisation code.  
3. **Organisation admin** (create via Team / Users with email + temporary password).  
4. Add **properties / centres / units** from management screens.  
5. Add **tenants**, **tickets**, listings, etc. from the UI.

No GAB / demo accounts are required.

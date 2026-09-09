-- ============================================================================
-- Delete seeded public.users so you manage staff via Auth + UI
-- Safe for tickets that reference seed users: nulls assigned_to where needed.
-- ============================================================================

BEGIN;

-- Drop FK blockers on demo ticket assignment
UPDATE public.tickets
SET assigned_to = NULL
WHERE assigned_to IN (SELECT id FROM public.users WHERE email IN (
  'admin@umhlabawami.sz',
  'lindiwe@ezulwiniproperties.sz',
  'sipho@ezulwiniproperties.sz',
  'nandi@swaziartisancrafts.sz',
  'bheki@ezulwiniproperties.sz',
  'thandeka@ezulwiniproperties.sz'
));

UPDATE public.tickets
SET created_by_user_id = COALESCE(
  (SELECT id FROM public.users WHERE role = 'super_admin' LIMIT 1),
  created_by_user_id
)
WHERE created_by_user_id IN (SELECT id FROM public.users WHERE email IN (
  'admin@umhlabawami.sz',
  'lindiwe@ezulwiniproperties.sz',
  'sipho@ezulwiniproperties.sz',
  'nandi@swaziartisancrafts.sz',
  'bheki@ezulwiniproperties.sz',
  'thandeka@ezulwiniproperties.sz'
));

UPDATE public.tenants SET user_id = NULL
WHERE user_id IN (SELECT id FROM public.users WHERE email IN (
  'admin@umhlabawami.sz',
  'lindiwe@ezulwiniproperties.sz',
  'sipho@ezulwiniproperties.sz',
  'nandi@swaziartisancrafts.sz',
  'bheki@ezulwiniproperties.sz',
  'thandeka@ezulwiniproperties.sz'
));

DELETE FROM public.users
WHERE email IN (
  'admin@umhlabawami.sz',
  'lindiwe@ezulwiniproperties.sz',
  'sipho@ezulwiniproperties.sz',
  'nandi@swaziartisancrafts.sz',
  'bheki@ezulwiniproperties.sz',
  'thandeka@ezulwiniproperties.sz'
);

COMMIT;

-- NEXT STEPS
-- 1. Run public/auth-users-sync.sql (trigger + policies)
-- 2. Authentication → Add user:
--      Email: your superadmin email
--      Auto Confirm: ON
--      User Metadata (JSON):
--      {
--        "username": "superadmin",
--        "name": "Platform Super Admin",
--        "role": "super_admin"
--      }
-- 3. Confirm a row appears in Table Editor → public.users
-- 4. Log into the app with org code SUPER + username superadmin (or email)
-- 5. Create other staff from Staff & Roles UI (writes public.users),
--    then create matching Auth users with THE SAME EMAIL + metadata role/username

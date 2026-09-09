-- ============================================================================
-- UMHLABA WAMI — NUKE ALL APP DATA (public schema)
-- WARNING: Irreversible. Deletes every row in app tables.
-- Does NOT drop tables. Does NOT delete auth.users (Supabase Auth identities).
-- Run in SQL Editor, then recreate Auth users + public profiles, then seed.
-- ============================================================================

BEGIN;

-- Disable triggers temporarily where helpful (optional safety)
SET session_replication_role = 'replica';

-- Child / dependent tables first (core + phase 3–7 if present)
TRUNCATE TABLE IF EXISTS
  public.webhook_deliveries,
  public.webhook_endpoints,
  public.ticket_photos,
  public.notify_outbox,
  public.field_job_states,
  public.csat_entries,
  public.popia_requests,
  public.handover_notes,
  public.cam_charges,
  public.lease_renewals,
  public.invoices,
  public.rent_payments,
  public.deposit_ledger,
  public.lease_pipeline_deals,
  public.permission_overrides,
  public.org_branding,
  public.assets,
  public.preventive_tasks,
  public.sla_matrices,
  public.staff_shifts,
  public.vendors,
  public.ticket_timeline,
  public.ticket_comments,
  public.attachments,
  public.tickets,
  public.leases,
  public.sla_agreements,
  public.finance_transactions,
  public.announcements,
  public.activity_logs,
  public.tenants,
  public.shops,
  public.properties,
  public.shopping_centers,
  public.users,
  public.organizations
RESTART IDENTITY CASCADE;

SET session_replication_role = 'origin';

COMMIT;

-- ---------------------------------------------------------------------------
-- If TRUNCATE fails because some phase3–7 tables were never created, use the
-- fallback block below instead (uncomment and run separately).
-- ---------------------------------------------------------------------------

/*
BEGIN;

-- Null out FKs that block user deletes (safe if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tickets') THEN
    EXECUTE 'UPDATE public.tickets SET assigned_to = NULL WHERE assigned_to IS NOT NULL';
    -- created_by is NOT NULL — delete tickets entirely
    EXECUTE 'DELETE FROM public.tickets';
  END IF;
END $$;

DELETE FROM public.ticket_timeline     WHERE TRUE;
DELETE FROM public.ticket_comments     WHERE TRUE;
DELETE FROM public.attachments         WHERE TRUE;
DELETE FROM public.leases              WHERE TRUE;
DELETE FROM public.sla_agreements      WHERE TRUE;
DELETE FROM public.finance_transactions WHERE TRUE;
DELETE FROM public.announcements       WHERE TRUE;
DELETE FROM public.activity_logs       WHERE TRUE;
DELETE FROM public.tenants             WHERE TRUE;
DELETE FROM public.shops               WHERE TRUE;
DELETE FROM public.properties          WHERE TRUE;
DELETE FROM public.shopping_centers    WHERE TRUE;
DELETE FROM public.users               WHERE TRUE;
DELETE FROM public.organizations       WHERE TRUE;

COMMIT;
*/

-- ---------------------------------------------------------------------------
-- Optional: also remove Auth identities (run in SQL with care)
-- This deletes every login in the project. You will recreate Super Admin after.
-- ---------------------------------------------------------------------------

/*
DELETE FROM auth.users;
*/

-- NEXT STEPS
-- 1. public/auth-users-sync.sql  (trigger Auth → public.users)
-- 2. Authentication → Add superadmin with metadata role=super_admin
-- 3. Confirm public.users has the superadmin row
-- 4. Seed orgs/centres/units WITHOUT users, or seed after more Auth users exist
--    Prefer: seed orgs + centres + properties + shops first, users only via Auth/UI

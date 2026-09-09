-- ============================================================================
-- UMHLABA WAMI — NUKE ALL APP DATA (public schema)
-- WARNING: Irreversible. Clears all rows in known app tables.
-- Does NOT drop tables. Does NOT touch auth.users unless you uncomment at end.
-- Postgres does NOT support "TRUNCATE TABLE IF EXISTS" — this uses safe DELETEs.
-- ============================================================================

BEGIN;

-- Break ticket FKs first (created_by is NOT NULL, so delete tickets entirely)
DO $$
BEGIN
  IF to_regclass('public.tickets') IS NOT NULL THEN
    UPDATE public.tickets SET assigned_to = NULL WHERE assigned_to IS NOT NULL;
    DELETE FROM public.tickets;
  END IF;
END $$;

-- Delete helper: only runs if table exists
CREATE OR REPLACE FUNCTION public._uw_nuke(p_table text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF to_regclass(format('public.%I', p_table)) IS NOT NULL THEN
    EXECUTE format('DELETE FROM public.%I', p_table);
  END IF;
END;
$$;

-- Phase 7 / 3–6 extras (no-op if missing)
SELECT public._uw_nuke('webhook_deliveries');
SELECT public._uw_nuke('webhook_endpoints');
SELECT public._uw_nuke('ticket_photos');
SELECT public._uw_nuke('notify_outbox');
SELECT public._uw_nuke('field_job_states');
SELECT public._uw_nuke('csat_entries');
SELECT public._uw_nuke('popia_requests');
SELECT public._uw_nuke('handover_notes');
SELECT public._uw_nuke('cam_charges');
SELECT public._uw_nuke('lease_renewals');
SELECT public._uw_nuke('invoices');
SELECT public._uw_nuke('rent_payments');
SELECT public._uw_nuke('deposit_ledger');
SELECT public._uw_nuke('lease_pipeline_deals');
SELECT public._uw_nuke('permission_overrides');
SELECT public._uw_nuke('org_branding');
SELECT public._uw_nuke('assets');
SELECT public._uw_nuke('preventive_tasks');
SELECT public._uw_nuke('sla_matrices');
SELECT public._uw_nuke('staff_shifts');
SELECT public._uw_nuke('vendors');

-- Core children → parents
SELECT public._uw_nuke('ticket_timeline');
SELECT public._uw_nuke('ticket_comments');
SELECT public._uw_nuke('attachments');
SELECT public._uw_nuke('tickets');
SELECT public._uw_nuke('leases');
SELECT public._uw_nuke('sla_agreements');
SELECT public._uw_nuke('finance_transactions');
SELECT public._uw_nuke('announcements');
SELECT public._uw_nuke('activity_logs');
SELECT public._uw_nuke('tenants');
SELECT public._uw_nuke('shops');
SELECT public._uw_nuke('properties');
SELECT public._uw_nuke('shopping_centers');
SELECT public._uw_nuke('users');
SELECT public._uw_nuke('organizations');

DROP FUNCTION IF EXISTS public._uw_nuke(text);

COMMIT;

-- Optional: wipe all Auth logins (then recreate superadmin in Authentication)
-- DELETE FROM auth.users;

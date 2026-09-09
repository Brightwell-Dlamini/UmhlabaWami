-- ============================================================================
-- Fallback nuke when TRUNCATE ... CASCADE is unavailable or tables missing
-- Deletes in dependency order. Ignores missing tables.
-- ============================================================================

BEGIN;

-- Helper: delete if table exists
CREATE OR REPLACE FUNCTION public._uw_safe_delete(p_table text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = p_table
  ) THEN
    EXECUTE format('DELETE FROM public.%I', p_table);
  END IF;
END;
$$;

-- Tickets: clear assignees then delete (created_by_user_id is NOT NULL)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tickets') THEN
    UPDATE public.tickets SET assigned_to = NULL WHERE assigned_to IS NOT NULL;
  END IF;
END $$;

SELECT public._uw_safe_delete('webhook_deliveries');
SELECT public._uw_safe_delete('webhook_endpoints');
SELECT public._uw_safe_delete('ticket_photos');
SELECT public._uw_safe_delete('notify_outbox');
SELECT public._uw_safe_delete('field_job_states');
SELECT public._uw_safe_delete('csat_entries');
SELECT public._uw_safe_delete('popia_requests');
SELECT public._uw_safe_delete('handover_notes');
SELECT public._uw_safe_delete('cam_charges');
SELECT public._uw_safe_delete('lease_renewals');
SELECT public._uw_safe_delete('invoices');
SELECT public._uw_safe_delete('rent_payments');
SELECT public._uw_safe_delete('deposit_ledger');
SELECT public._uw_safe_delete('lease_pipeline_deals');
SELECT public._uw_safe_delete('permission_overrides');
SELECT public._uw_safe_delete('org_branding');
SELECT public._uw_safe_delete('assets');
SELECT public._uw_safe_delete('preventive_tasks');
SELECT public._uw_safe_delete('sla_matrices');
SELECT public._uw_safe_delete('staff_shifts');
SELECT public._uw_safe_delete('vendors');
SELECT public._uw_safe_delete('ticket_timeline');
SELECT public._uw_safe_delete('ticket_comments');
SELECT public._uw_safe_delete('attachments');
SELECT public._uw_safe_delete('tickets');
SELECT public._uw_safe_delete('leases');
SELECT public._uw_safe_delete('sla_agreements');
SELECT public._uw_safe_delete('finance_transactions');
SELECT public._uw_safe_delete('announcements');
SELECT public._uw_safe_delete('activity_logs');
SELECT public._uw_safe_delete('tenants');
SELECT public._uw_safe_delete('shops');
SELECT public._uw_safe_delete('properties');
SELECT public._uw_safe_delete('shopping_centers');
SELECT public._uw_safe_delete('users');
SELECT public._uw_safe_delete('organizations');

DROP FUNCTION IF EXISTS public._uw_safe_delete(text);

COMMIT;

-- Optional Auth wipe (all logins):
-- DELETE FROM auth.users;

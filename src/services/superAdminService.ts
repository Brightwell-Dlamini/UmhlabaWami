/**
 * Super Admin platform operations — billing, org lifecycle, live analytics.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from './db';
import { DEFAULT_SUBSCRIPTION_PLANS } from './db';
import type { Organization, SubscriptionTier } from '../types';

export async function updateOrganizationBilling(input: {
  orgId: string;
  subscription_tier?: SubscriptionTier;
  monthly_fee?: number;
  property_limit?: number;
  tenant_limit?: number;
  user_limit?: number;
  storage_limit?: number;
  status?: Organization['status'];
  updated_by?: string;
}): Promise<{ success: boolean; organization?: Organization; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Service unavailable.' };
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc('update_organization_billing', {
    p_org_id: input.orgId,
    p_subscription_tier: input.subscription_tier ?? null,
    p_monthly_fee: input.monthly_fee ?? null,
    p_property_limit: input.property_limit ?? null,
    p_tenant_limit: input.tenant_limit ?? null,
    p_user_limit: input.user_limit ?? null,
    p_storage_limit: input.storage_limit ?? null,
    p_status: input.status ?? null,
    p_updated_by: input.updated_by || 'Super Admin',
  });

  let org: Organization | null = null;

  if (!rpcError && rpcData) {
    org = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as Organization;
  } else {
    const patch: Record<string, unknown> = {};
    if (input.subscription_tier) patch.subscription_tier = input.subscription_tier;
    if (input.monthly_fee != null) {
      patch.monthly_fee_estimate = input.monthly_fee;
      patch.custom_monthly_fee = input.monthly_fee;
    }
    if (input.property_limit != null) patch.property_limit = input.property_limit;
    if (input.tenant_limit != null) patch.tenant_limit = input.tenant_limit;
    if (input.user_limit != null) patch.user_limit = input.user_limit;
    if (input.storage_limit != null) patch.storage_limit = input.storage_limit;
    if (input.status) patch.status = input.status;

    const { data, error } = await supabase
      .from('organizations')
      .update(patch)
      .eq('id', input.orgId)
      .select('*')
      .single();

    if (error) {
      console.error('[superAdmin] billing update', error);
      return { success: false, error: error.message };
    }
    org = data as Organization;
  }

  if (!org) return { success: false, error: 'Update failed.' };

  const idx = db.organizations.findIndex((o) => o.id === input.orgId);
  if (idx >= 0) db.organizations[idx] = { ...db.organizations[idx], ...org };
  db.saveToStorage();

  return { success: true, organization: org };
}

export function getPlatformAnalytics() {
  const orgs = db.organizations;
  const activeOrgs = orgs.filter((o) => o.status === 'Active');
  const pendingOrgs = orgs.filter((o) => o.status === 'Pending Approval');
  const users = db.users;
  const shops = db.shops;
  const properties = db.properties;
  const tenants = db.tenants;
  const tickets = db.tickets;
  const openTickets = tickets.filter((t) =>
    ['Open', 'In Progress', 'Awaiting Approval', 'Reopened'].includes(t.status)
  );
  const overdue = tickets.filter((t) => t.sla_status === 'Breached' || t.sla_status === 'At Risk');
  const resolved = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed');

  const occupied = shops.filter((s) => s.status === 'Occupied').length;
  const available = shops.filter((s) => s.status === 'Available').length;
  const occupancy =
    shops.length > 0 ? Math.round((occupied / shops.length) * 1000) / 10 : 0;

  const mrr = activeOrgs.reduce((sum, o) => {
    const plan = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.tier === o.subscription_tier);
    return sum + (o.monthly_fee_estimate ?? plan?.pricePerMonthE ?? 0);
  }, 0);

  const rentRoll = db.leases
    .filter((l) => l.renewal_status === 'Active' || l.renewal_status === 'Expiring Soon')
    .reduce((s, l) => s + (l.rental_amount || 0), 0);

  return {
    total_organizations: orgs.length,
    active_organizations: activeOrgs.length,
    pending_organizations: pendingOrgs.length,
    suspended_organizations: orgs.filter((o) => o.status === 'Suspended').length,
    total_users: users.length,
    total_properties: properties.length,
    total_units: shops.length,
    occupied_units: occupied,
    available_units: available,
    occupancy_rate: occupancy,
    total_tenants: tenants.length,
    open_tickets: openTickets.length,
    overdue_tickets: overdue.length,
    resolved_tickets: resolved.length,
    sla_compliance_pct:
      tickets.length > 0
        ? Math.round(((tickets.length - overdue.length) / tickets.length) * 1000) / 10
        : 100,
    platform_mrr: mrr,
    portfolio_rent_roll: rentRoll,
    orgs_by_tier: {
      Starter: activeOrgs.filter((o) => o.subscription_tier === 'Starter').length,
      Professional: activeOrgs.filter((o) => o.subscription_tier === 'Professional').length,
      Enterprise: activeOrgs.filter((o) => o.subscription_tier === 'Enterprise').length,
    },
    recent_orgs: [...orgs].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 8),
  };
}

export function applyTierDefaults(tier: SubscriptionTier) {
  const plan = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.tier === tier);
  if (!plan) return null;
  return {
    subscription_tier: tier,
    monthly_fee: plan.pricePerMonthE,
    property_limit: plan.propertyLimit,
    tenant_limit: plan.tenantLimit,
    user_limit: plan.userLimit,
    storage_limit: plan.storageLimitGb,
  };
}

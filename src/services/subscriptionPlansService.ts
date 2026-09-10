/**
 * Editable subscription plan catalog (Super Admin).
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db, DEFAULT_SUBSCRIPTION_PLANS } from './db';
import type { SubscriptionConfig } from '../types';

export type PlanRow = SubscriptionConfig & { id?: string; sort_order?: number; is_active?: boolean };

function mapRow(row: Record<string, unknown>): PlanRow {
  return {
    id: String(row.id),
    tier: String(row.tier_key) as SubscriptionConfig['tier'],
    name: String(row.name),
    propertyLimit: Number(row.property_limit),
    tenantLimit: Number(row.tenant_limit),
    userLimit: Number(row.user_limit),
    storageLimitGb: Number(row.storage_limit_gb),
    pricePerMonthE: Number(row.price_per_month),
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    sort_order: Number(row.sort_order || 0),
    is_active: row.is_active !== false,
  };
}

export async function loadSubscriptionPlans(): Promise<PlanRow[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (!error && data && data.length) {
      const plans = data.map(mapRow);
      db.subscriptionPlans = plans;
      return plans;
    }
  }
  return db.subscriptionPlans?.length ? db.subscriptionPlans : DEFAULT_SUBSCRIPTION_PLANS;
}

export async function saveSubscriptionPlan(plan: PlanRow): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // Local fallback
    const idx = db.subscriptionPlans.findIndex((p) => p.tier === plan.tier);
    if (idx >= 0) db.subscriptionPlans[idx] = plan;
    else db.subscriptionPlans.push(plan);
    db.saveToStorage();
    return { success: true };
  }

  const payload = {
    tier_key: plan.tier,
    name: plan.name,
    property_limit: plan.propertyLimit,
    tenant_limit: plan.tenantLimit,
    user_limit: plan.userLimit,
    storage_limit_gb: plan.storageLimitGb,
    price_per_month: plan.pricePerMonthE,
    features: plan.features,
    is_active: plan.is_active !== false,
    sort_order: plan.sort_order ?? 0,
    updated_at: new Date().toISOString(),
  };

  if (plan.id) {
    const { error } = await supabase.from('subscription_plans').update(payload).eq('id', plan.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from('subscription_plans').upsert(payload, { onConflict: 'tier_key' });
    if (error) return { success: false, error: error.message };
  }

  await loadSubscriptionPlans();
  return { success: true };
}

export async function deactivateSubscriptionPlan(tierKey: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    db.subscriptionPlans = db.subscriptionPlans.filter((p) => p.tier !== tierKey);
    db.saveToStorage();
    return { success: true };
  }
  const { error } = await supabase
    .from('subscription_plans')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('tier_key', tierKey);
  if (error) return { success: false, error: error.message };
  await loadSubscriptionPlans();
  return { success: true };
}

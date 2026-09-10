import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Pencil, Save, X, Plus, Layers } from 'lucide-react';
import { commercial } from '../../services/commercialService';
import { auth } from '../../services/auth';
import { db } from '../../services/db';
import { updateOrganizationBilling, applyTierDefaults } from '../../services/superAdminService';
import {
  loadSubscriptionPlans,
  saveSubscriptionPlan,
  deactivateSubscriptionPlan,
  type PlanRow,
} from '../../services/subscriptionPlansService';
import type { Organization } from '../../types';

function fmt(n: number) {
  return `E${n.toLocaleString()}`;
}

export const SubscriptionBillingView: React.FC = () => {
  const user = auth.getCurrentUser();
  const isSuper = user?.role === 'super_admin';
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [rows, setRows] = useState(() => commercial.getSubscriptionBilling());
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fee, setFee] = useState(0);
  const [tier, setTier] = useState('Professional');
  const [propLimit, setPropLimit] = useState(10);
  const [tenantLimit, setTenantLimit] = useState(500);
  const [userLimit, setUserLimit] = useState(30);
  const [saving, setSaving] = useState(false);

  // Plan catalog editor
  const [planEdit, setPlanEdit] = useState<PlanRow | null>(null);
  const [showNewPlan, setShowNewPlan] = useState(false);

  useEffect(() => {
    void loadSubscriptionPlans().then(setPlans);
    const unsub = db.subscribe(() => setRows(commercial.getSubscriptionBilling()));
    return () => unsub();
  }, []);

  const refresh = async () => {
    setPlans(await loadSubscriptionPlans());
    setRows(commercial.getSubscriptionBilling());
  };

  const startEdit = (org: Organization) => {
    setEditingId(org.id);
    setTier(String(org.subscription_tier));
    const plan = plans.find((p) => p.tier === org.subscription_tier);
    setFee(org.monthly_fee_estimate ?? plan?.pricePerMonthE ?? 0);
    setPropLimit(org.property_limit);
    setTenantLimit(org.tenant_limit);
    setUserLimit(org.user_limit);
  };

  const onTierSelect = (t: string) => {
    setTier(t);
    const plan = plans.find((p) => p.tier === t);
    if (plan) {
      setFee(plan.pricePerMonthE);
      setPropLimit(plan.propertyLimit);
      setTenantLimit(plan.tenantLimit);
      setUserLimit(plan.userLimit);
    } else {
      const d = applyTierDefaults(t as 'Starter');
      if (d) {
        setFee(d.monthly_fee);
        setPropLimit(d.property_limit);
        setTenantLimit(d.tenant_limit);
        setUserLimit(d.user_limit);
      }
    }
  };

  const saveBilling = async () => {
    if (!editingId || !isSuper) return;
    setSaving(true);
    const result = await updateOrganizationBilling({
      orgId: editingId,
      subscription_tier: tier as 'Starter',
      monthly_fee: fee,
      property_limit: propLimit,
      tenant_limit: tenantLimit,
      user_limit: userLimit,
      updated_by: user?.name || 'Super Admin',
    });
    setSaving(false);
    if (!result.success) {
      setNotice(result.error || 'Could not save billing.');
      return;
    }
    const org = db.organizations.find((o) => o.id === editingId);
    if (org) {
      org.subscription_tier = tier as Organization['subscription_tier'];
      org.monthly_fee_estimate = fee;
      org.property_limit = propLimit;
      org.tenant_limit = tenantLimit;
      org.user_limit = userLimit;
      db.saveToStorage();
    }
    setEditingId(null);
    await refresh();
    setNotice('Client billing saved.');
    setTimeout(() => setNotice(''), 3500);
  };

  const openNewPlan = () => {
    setPlanEdit({
      tier: '',
      name: '',
      propertyLimit: 5,
      tenantLimit: 200,
      userLimit: 15,
      storageLimitGb: 25,
      pricePerMonthE: 2500,
      features: ['Custom feature'],
      sort_order: plans.length + 1,
    });
    setShowNewPlan(true);
  };

  const savePlan = async () => {
    if (!planEdit || !planEdit.tier.trim() || !planEdit.name.trim()) {
      setNotice('Tier key and name are required.');
      return;
    }
    const key = planEdit.tier.trim().replace(/\s+/g, '_');
    const result = await saveSubscriptionPlan({ ...planEdit, tier: key as PlanRow['tier'] });
    if (!result.success) {
      setNotice(result.error || 'Could not save plan.');
      return;
    }
    setShowNewPlan(false);
    setPlanEdit(null);
    await refresh();
    setNotice(`Plan "${key}" saved.`);
    setTimeout(() => setNotice(''), 3000);
  };

  const mrr = rows.filter((r) => r.status === 'Active').reduce((s, r) => s + r.monthly_fee, 0);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Subscription Billing
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Edit list prices and tiers, or set a negotiated fee per organisation. Active MRR:{' '}
          <strong>{fmt(mrr)}</strong>
        </p>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      {/* Plan catalog */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" /> Platform tiers (list prices)
          </h2>
          {isSuper && (
            <button
              type="button"
              onClick={openNewPlan}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add tier
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plans.map((p) => (
            <div
              key={p.tier}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative"
            >
              <div className="text-xs font-bold text-blue-600">{p.tier}</div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{p.name}</div>
              <div className="text-lg font-extrabold mt-1">{fmt(p.pricePerMonthE)}/mo</div>
              <ul className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                <li>• {p.propertyLimit} properties · {p.tenantLimit} tenants · {p.userLimit} users</li>
                {p.features.slice(0, 3).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              {isSuper && (
                <button
                  type="button"
                  onClick={() => {
                    setPlanEdit({ ...p });
                    setShowNewPlan(true);
                  }}
                  className="mt-3 text-[11px] font-semibold text-blue-600 inline-flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" /> Edit tier
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Plan editor modal */}
      {showNewPlan && planEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">{planEdit.id ? 'Edit tier' : 'New tier'}</h3>
              <button type="button" onClick={() => setShowNewPlan(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="col-span-2">
                <label className="text-[10px] font-semibold text-slate-500">Tier key *</label>
                <input
                  value={planEdit.tier}
                  disabled={!!planEdit.id}
                  onChange={(e) => setPlanEdit({ ...planEdit, tier: e.target.value })}
                  placeholder="e.g. Growth"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-semibold text-slate-500">Display name *</label>
                <input
                  value={planEdit.name}
                  onChange={(e) => setPlanEdit({ ...planEdit, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500">Price / month (E)</label>
                <input
                  type="number"
                  value={planEdit.pricePerMonthE}
                  onChange={(e) => setPlanEdit({ ...planEdit, pricePerMonthE: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500">Properties</label>
                <input
                  type="number"
                  value={planEdit.propertyLimit}
                  onChange={(e) => setPlanEdit({ ...planEdit, propertyLimit: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500">Tenants</label>
                <input
                  type="number"
                  value={planEdit.tenantLimit}
                  onChange={(e) => setPlanEdit({ ...planEdit, tenantLimit: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500">Users</label>
                <input
                  type="number"
                  value={planEdit.userLimit}
                  onChange={(e) => setPlanEdit({ ...planEdit, userLimit: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-semibold text-slate-500">Features (comma-separated)</label>
                <input
                  value={planEdit.features.join(', ')}
                  onChange={(e) =>
                    setPlanEdit({
                      ...planEdit,
                      features: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-between gap-2 pt-2">
              {planEdit.id && (
                <button
                  type="button"
                  onClick={async () => {
                    await deactivateSubscriptionPlan(String(planEdit.tier));
                    setShowNewPlan(false);
                    await refresh();
                    setNotice('Tier deactivated.');
                  }}
                  className="text-xs text-red-600 font-semibold"
                >
                  Deactivate
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button type="button" onClick={() => setShowNewPlan(false)} className="px-3 py-1.5 text-xs rounded-xl border">
                  Cancel
                </button>
                <button type="button" onClick={() => void savePlan()} className="px-3 py-1.5 text-xs rounded-xl bg-blue-600 text-white font-semibold">
                  Save tier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per-org billing */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Per-organisation billing</h2>
          <p className="text-[11px] text-slate-500">Negotiated fees override list prices for that client.</p>
        </div>
        <table className="w-full text-xs min-w-[720px]">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500">
            <tr>
              <th className="p-3 text-left">Organisation</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Tier</th>
              <th className="p-3 text-left">Monthly fee</th>
              <th className="p-3 text-left">Limits</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.map((r) => {
              const isEditing = editingId === r.organization.id;
              return (
                <tr key={r.organization.id}>
                  <td className="p-3">
                    <div className="font-bold">{r.organization.company_name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{r.organization.organization_code}</div>
                  </td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">
                    {isEditing ? (
                      <select
                        value={tier}
                        onChange={(e) => onTierSelect(e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                      >
                        {plans.map((p) => (
                          <option key={p.tier} value={p.tier}>
                            {p.tier}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-semibold">{r.organization.subscription_tier}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">E</span>
                        <input
                          type="number"
                          value={fee}
                          onChange={(e) => setFee(Number(e.target.value))}
                          className="w-28 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold"
                        />
                      </div>
                    ) : (
                      <span className="font-bold text-blue-600">{fmt(r.monthly_fee)}</span>
                    )}
                  </td>
                  <td className="p-3 text-[10px] text-slate-500">
                    {isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        <label className="flex items-center gap-1">
                          Props
                          <input type="number" value={propLimit} onChange={(e) => setPropLimit(Number(e.target.value))} className="w-14 px-1 py-0.5 rounded border" />
                        </label>
                        <label className="flex items-center gap-1">
                          Tenants
                          <input type="number" value={tenantLimit} onChange={(e) => setTenantLimit(Number(e.target.value))} className="w-16 px-1 py-0.5 rounded border" />
                        </label>
                        <label className="flex items-center gap-1">
                          Users
                          <input type="number" value={userLimit} onChange={(e) => setUserLimit(Number(e.target.value))} className="w-14 px-1 py-0.5 rounded border" />
                        </label>
                      </div>
                    ) : (
                      <>
                        Props {r.usage.properties}/{r.usage.property_limit} · Tenants {r.usage.tenants}/
                        {r.usage.tenant_limit} · Users {r.usage.users}/{r.usage.user_limit}
                      </>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {isSuper &&
                      (isEditing ? (
                        <div className="inline-flex gap-1">
                          <button type="button" disabled={saving} onClick={() => void saveBilling()} className="px-2 py-1 rounded-lg bg-blue-600 text-white font-semibold inline-flex items-center gap-1">
                            <Save className="w-3 h-3" /> {saving ? '…' : 'Save'}
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className="px-2 py-1 rounded-lg border">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => startEdit(r.organization)} className="px-2 py-1 rounded-lg border inline-flex items-center gap-1 font-semibold">
                          <Pencil className="w-3 h-3" /> Customise
                        </button>
                      ))}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No organisations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

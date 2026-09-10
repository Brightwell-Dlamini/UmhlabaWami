import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Pencil, Save, X } from 'lucide-react';
import { commercial } from '../../services/commercialService';
import { auth } from '../../services/auth';
import { db } from '../../services/db';
import { DEFAULT_SUBSCRIPTION_PLANS } from '../../services/db';
import { updateOrganizationBilling, applyTierDefaults } from '../../services/superAdminService';
import type { SubscriptionTier, Organization } from '../../types';

function fmt(n: number) {
  return `E${n.toLocaleString()}`;
}

export const SubscriptionBillingView: React.FC = () => {
  const user = auth.getCurrentUser();
  const isSuper = user?.role === 'super_admin';
  const [rows, setRows] = useState(() => commercial.getSubscriptionBilling());
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fee, setFee] = useState<number>(0);
  const [tier, setTier] = useState<SubscriptionTier>('Professional');
  const [propLimit, setPropLimit] = useState(10);
  const [tenantLimit, setTenantLimit] = useState(500);
  const [userLimit, setUserLimit] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = db.subscribe(() => setRows(commercial.getSubscriptionBilling()));
    return () => unsub();
  }, []);

  const refresh = () => setRows(commercial.getSubscriptionBilling());

  const startEdit = (org: Organization) => {
    setEditingId(org.id);
    setTier(org.subscription_tier);
    const plan = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.tier === org.subscription_tier);
    setFee(org.monthly_fee_estimate ?? plan?.pricePerMonthE ?? 0);
    setPropLimit(org.property_limit);
    setTenantLimit(org.tenant_limit);
    setUserLimit(org.user_limit);
  };

  const onTierSelect = (t: SubscriptionTier) => {
    setTier(t);
    const defaults = applyTierDefaults(t);
    if (defaults) {
      setFee(defaults.monthly_fee);
      setPropLimit(defaults.property_limit);
      setTenantLimit(defaults.tenant_limit);
      setUserLimit(defaults.user_limit);
    }
  };

  const saveBilling = async () => {
    if (!editingId || !isSuper) return;
    setSaving(true);
    const result = await updateOrganizationBilling({
      orgId: editingId,
      subscription_tier: tier,
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
    // Keep commercial cache in sync
    commercial.changeOrgTier(editingId, tier, user?.name || 'Super Admin');
    const org = db.organizations.find((o) => o.id === editingId);
    if (org) {
      org.monthly_fee_estimate = fee;
      org.property_limit = propLimit;
      org.tenant_limit = tenantLimit;
      org.user_limit = userLimit;
      db.saveToStorage();
    }
    setEditingId(null);
    refresh();
    setNotice('Billing updated and saved to the database.');
    setTimeout(() => setNotice(''), 4000);
  };

  const mrr = rows
    .filter((r) => r.status === 'Active')
    .reduce((s, r) => s + r.monthly_fee, 0);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Organisation Subscription Billing
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customise tier, monthly fee, and limits per client. List prices are estimates — set the real fee per organisation.
          Active MRR: <strong>{fmt(mrr)}</strong>
        </p>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DEFAULT_SUBSCRIPTION_PLANS.map((p) => (
          <div
            key={p.tier}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div className="text-xs font-bold text-blue-600">{p.tier}</div>
            <div className="text-lg font-extrabold">{fmt(p.pricePerMonthE)}/mo</div>
            <p className="text-[10px] text-slate-400 mt-1">List price (starting point)</p>
            <ul className="mt-2 text-[11px] text-slate-500 space-y-0.5">
              {p.features.slice(0, 4).map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
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
                    <div className="font-bold text-slate-900 dark:text-white">{r.organization.company_name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{r.organization.organization_code}</div>
                  </td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">
                    {isEditing ? (
                      <select
                        value={tier}
                        onChange={(e) => onTierSelect(e.target.value as SubscriptionTier)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                      >
                        <option value="Starter">Starter</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
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
                          min={0}
                          step={100}
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
                          <input type="number" value={propLimit} onChange={(e) => setPropLimit(Number(e.target.value))} className="w-14 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900" />
                        </label>
                        <label className="flex items-center gap-1">
                          Tenants
                          <input type="number" value={tenantLimit} onChange={(e) => setTenantLimit(Number(e.target.value))} className="w-16 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900" />
                        </label>
                        <label className="flex items-center gap-1">
                          Users
                          <input type="number" value={userLimit} onChange={(e) => setUserLimit(Number(e.target.value))} className="w-14 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900" />
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
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void saveBilling()}
                            className="px-2 py-1 rounded-lg bg-blue-600 text-white font-semibold inline-flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" /> {saving ? '…' : 'Save'}
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(r.organization)}
                          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 inline-flex items-center gap-1 font-semibold"
                        >
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
                  No organisations yet. Approve a registration to start billing.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

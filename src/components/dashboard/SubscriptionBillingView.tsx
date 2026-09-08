import React, { useState } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { commercial } from '../../services/commercialService';
import { auth } from '../../services/auth';
import { DEFAULT_SUBSCRIPTION_PLANS } from '../../services/db';
import type { SubscriptionTier } from '../../types';

function fmt(n: number) {
  return `E${n.toLocaleString()}`;
}

export const SubscriptionBillingView: React.FC = () => {
  const user = auth.getCurrentUser();
  const [rows, setRows] = useState(() => commercial.getSubscriptionBilling());
  const [notice, setNotice] = useState('');

  const changeTier = (orgId: string, tier: SubscriptionTier) => {
    commercial.changeOrgTier(orgId, tier, user?.name || 'Super Admin');
    setRows(commercial.getSubscriptionBilling());
    setNotice(`Subscription updated to ${tier}`);
    setTimeout(() => setNotice(''), 3000);
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
          Platform SaaS fees, tier limits, and usage metering. Active MRR:{' '}
          <strong>{fmt(mrr)}</strong>
        </p>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
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
            <ul className="mt-2 text-[11px] text-slate-500 space-y-0.5">
              {p.features.slice(0, 4).map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500">
            <tr>
              <th className="p-3 text-left">Organisation</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Tier</th>
              <th className="p-3 text-left">Fee</th>
              <th className="p-3 text-left">Usage</th>
              <th className="p-3 text-left">Change tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.map((r) => (
              <tr key={r.organization.id}>
                <td className="p-3">
                  <div className="font-bold">{r.organization.company_name}</div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {r.organization.organization_code}
                  </div>
                </td>
                <td className="p-3">{r.status}</td>
                <td className="p-3 font-semibold">{r.organization.subscription_tier}</td>
                <td className="p-3">{fmt(r.monthly_fee)}</td>
                <td className="p-3 text-[10px] text-slate-500">
                  Props {r.usage.properties}/{r.usage.property_limit} · Tenants{' '}
                  {r.usage.tenants}/{r.usage.tenant_limit} · Users {r.usage.users}/{r.usage.user_limit}
                </td>
                <td className="p-3">
                  <select
                    value={r.organization.subscription_tier}
                    onChange={(e) =>
                      changeTier(r.organization.id, e.target.value as SubscriptionTier)
                    }
                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                    disabled={user?.role !== 'super_admin'}
                  >
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

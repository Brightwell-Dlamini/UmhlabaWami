import React, { useMemo, useState } from 'react';
import { Wallet, CheckCircle2, X } from 'lucide-react';
import { commercial } from '../../services/commercialService';
import { auth } from '../../services/auth';
import { db } from '../../services/db';

function fmt(n: number) {
  return `E${n.toLocaleString()}`;
}

export const DepositLedgerView: React.FC = () => {
  const user = auth.getCurrentUser();
  const orgId = user?.organization_id;
  const [tick, setTick] = useState(0);
  const entries = useMemo(() => commercial.getDepositLedger(orgId), [orgId, tick]);
  const [showAction, setShowAction] = useState(false);
  const [tenantId, setTenantId] = useState(db.tenants[0]?.id || '');
  const [amount, setAmount] = useState(5000);
  const [direction, setDirection] = useState<'partial_refund' | 'full_refund' | 'forfeit'>('partial_refund');
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');

  const tenants = orgId ? db.tenants.filter((t) => t.organization_id === orgId) : db.tenants;

  const balances = tenants.map((t) => ({
    tenant: t,
    balance: commercial.getDepositBalance(t.id),
  }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = db.tenants.find((t) => t.id === tenantId);
    if (!tenant || !orgId) return;
    commercial.processDepositAction({
      organization_id: orgId,
      tenant_id: tenant.id,
      shop_id: tenant.shop_id,
      amount: direction === 'full_refund' ? commercial.getDepositBalance(tenant.id) : amount,
      direction,
      reason: reason || `Deposit ${direction}`,
      actor: user?.name || 'Finance',
    });
    setShowAction(false);
    setTick((x) => x + 1);
    setNotice('Deposit ledger updated');
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Deposit Ledger</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Security deposits held, partial/full refunds, and forfeits with audit trail.
          </p>
        </div>
        <button
          onClick={() => setShowAction(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow"
        >
          Process refund / forfeit
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {balances.map(({ tenant, balance }) => (
          <div
            key={tenant.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div className="font-bold text-sm text-slate-900 dark:text-white">{tenant.business_name}</div>
            <div className="text-[11px] text-slate-500">{tenant.contact_person}</div>
            <div className="mt-2 text-lg font-extrabold text-blue-600">{fmt(balance)}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Held balance</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-3 border-b border-slate-100 dark:border-slate-700 text-xs font-bold">Transaction history</div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
          {[...entries].reverse().map((e) => {
            const tenant = db.tenants.find((t) => t.id === e.tenant_id);
            return (
              <div key={e.id} className="p-3 text-xs flex justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {tenant?.business_name || e.tenant_id} · {e.direction}
                  </div>
                  <div className="text-slate-500">{e.reason}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold">{fmt(e.amount)}</div>
                  <div className="text-[10px] text-slate-400">Bal {fmt(e.balance_after)} · {e.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form onSubmit={submit} className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 space-y-3 text-xs border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex justify-between">
              <h3 className="font-bold text-sm">Deposit action</h3>
              <button type="button" onClick={() => setShowAction(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="font-semibold block mb-1">Tenant</label>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.business_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">Action</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as typeof direction)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
              >
                <option value="partial_refund">Partial refund</option>
                <option value="full_refund">Full refund</option>
                <option value="forfeit">Forfeit to landlord</option>
              </select>
            </div>
            {direction !== 'full_refund' && (
              <div>
                <label className="font-semibold block mb-1">Amount (E)</label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                />
              </div>
            )}
            <div>
              <label className="font-semibold block mb-1">Reason</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                placeholder="e.g. Move-out inspection — minor wall damage retained"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAction(false)} className="px-3 py-2">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl">
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

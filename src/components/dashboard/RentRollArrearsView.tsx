import React, { useMemo, useState } from 'react';
import { DollarSign, AlertTriangle, CheckCircle2, PlusCircle, X, Download } from 'lucide-react';
import { commercial, RentRollRow } from '../../services/commercialService';
import { auth } from '../../services/auth';
import { db } from '../../services/db';

function fmt(n: number) {
  return `E${n.toLocaleString('en-SZ', { maximumFractionDigits: 0 })}`;
}

export const RentRollArrearsView: React.FC = () => {
  const user = auth.getCurrentUser();
  const orgId = user?.organization_id;
  const [tick, setTick] = useState(0);
  const rows = useMemo(() => commercial.getRentRoll(orgId), [orgId, tick]);
  const [filter, setFilter] = useState<'all' | 'arrears'>('all');
  const [payRow, setPayRow] = useState<RentRollRow | null>(null);
  const [amount, setAmount] = useState(0);
  const [reference, setReference] = useState('');
  const [notice, setNotice] = useState('');

  const visible = filter === 'arrears' ? rows.filter((r) => r.arrears > 0) : rows;
  const totalRent = rows.reduce((s, r) => s + r.monthly_rent, 0);
  const totalArrears = rows.reduce((s, r) => s + r.arrears, 0);
  const totalCollected = rows.reduce((s, r) => s + r.collected_ytd, 0);

  const openPay = (r: RentRollRow) => {
    setPayRow(r);
    setAmount(r.arrears > 0 ? r.arrears : r.monthly_rent);
    setReference(`RNT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`);
  };

  const submitPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payRow || !orgId) return;
    const tenant = db.tenants.find((t) => t.id === payRow.tenant_id);
    const shop = db.shops.find((s) => s.shop_number === payRow.shop_number);
    if (!tenant || !shop) return;
    commercial.recordRentPayment({
      organization_id: orgId,
      property_id: shop.property_id,
      shop_id: shop.id,
      tenant_id: tenant.id,
      amount,
      reference,
      recorded_by: user?.name || 'Finance',
    });
    setPayRow(null);
    setTick((t) => t + 1);
    setNotice(`Recorded ${fmt(amount)} for ${payRow.business_name}`);
    setTimeout(() => setNotice(''), 3500);
  };

  const agingColor = (b: RentRollRow['aging_bucket']) => {
    if (b === 'Current') return 'text-emerald-600';
    if (b === '1-30') return 'text-amber-600';
    if (b === '31-60') return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Rent Roll & Arrears
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Expected vs collected, aging buckets, and one-click payment recording (Emalangeni).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter(filter === 'all' ? 'arrears' : 'all')}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
          >
            {filter === 'all' ? 'Show arrears only' : 'Show all tenants'}
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-[10px] uppercase text-slate-500 font-bold">Monthly rent roll</div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white">{fmt(totalRent)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-[10px] uppercase text-slate-500 font-bold">Collected (period)</div>
          <div className="text-lg font-extrabold text-emerald-600">{fmt(totalCollected)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/40">
          <div className="text-[10px] uppercase text-red-500 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Total arrears
          </div>
          <div className="text-lg font-extrabold text-red-600">{fmt(totalArrears)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-[10px] uppercase text-slate-500 font-bold">Tenants on roll</div>
          <div className="text-lg font-extrabold">{rows.length}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500">
              <tr>
                <th className="p-3 font-semibold">Tenant / Unit</th>
                <th className="p-3 font-semibold">Monthly</th>
                <th className="p-3 font-semibold">Collected</th>
                <th className="p-3 font-semibold">Arrears</th>
                <th className="p-3 font-semibold">Aging</th>
                <th className="p-3 font-semibold">Lease end</th>
                <th className="p-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {visible.map((r) => (
                <tr key={r.tenant_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{r.business_name}</div>
                    <div className="text-[10px] text-slate-500">
                      {r.shop_number} · {r.property_name}
                    </div>
                  </td>
                  <td className="p-3 font-semibold">{fmt(r.monthly_rent)}</td>
                  <td className="p-3 text-emerald-700 dark:text-emerald-400">{fmt(r.collected_ytd)}</td>
                  <td className="p-3 font-bold text-red-600">{r.arrears ? fmt(r.arrears) : '—'}</td>
                  <td className={`p-3 font-bold ${agingColor(r.aging_bucket)}`}>{r.aging_bucket}</td>
                  <td className="p-3 text-slate-500">{r.lease_end}</td>
                  <td className="p-3">
                    <button
                      onClick={() => openPay(r)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-[11px]"
                    >
                      Record payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {payRow && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={submitPay}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Record rent — {payRow.business_name}</h3>
              <button type="button" onClick={() => setPayRow(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="text-xs space-y-3">
              <div>
                <label className="font-semibold block mb-1">Amount (E)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Reference</label>
                <input
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                  placeholder="Bank ref / receipt no."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPayRow(null)} className="px-3 py-2 text-xs">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">
                Save payment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

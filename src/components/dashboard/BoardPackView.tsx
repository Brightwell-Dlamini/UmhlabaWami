import React, { useMemo, useState } from 'react';
import { FileBarChart, Download, RefreshCw } from 'lucide-react';
import { commercial } from '../../services/commercialService';
import { auth } from '../../services/auth';

function fmt(n: number) {
  return `E${n.toLocaleString('en-SZ', { maximumFractionDigits: 0 })}`;
}

export const BoardPackView: React.FC = () => {
  const user = auth.getCurrentUser();
  const orgId = user?.organization_id;
  const [tick, setTick] = useState(0);
  const pack = useMemo(() => commercial.getBoardPack(orgId), [orgId, tick]);

  const download = () => {
    const text = commercial.exportBoardPackText(orgId);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board-pack-${pack.organization_name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Board Pack</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Executive snapshot — occupancy, rent roll, arrears, operations, leasing pipeline.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTick((t) => t + 1)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={download}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" /> Export pack
          </button>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="text-[10px] uppercase tracking-widest text-blue-200 font-bold">
          {pack.organization_name}
        </div>
        <div className="text-2xl font-bold mt-1">Board Pack Summary</div>
        <div className="text-xs text-blue-100 mt-1">
          Generated {new Date(pack.generated_at).toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Occupancy', value: `${pack.occupancy_rate}%` },
          { label: 'Monthly rent roll', value: fmt(pack.monthly_rent_roll) },
          { label: 'Arrears', value: fmt(pack.arrears_total) },
          { label: 'Deposits held', value: fmt(pack.deposits_held) },
          { label: 'Vacant units', value: String(pack.vacant_units) },
          { label: 'Open tickets', value: String(pack.open_tickets) },
          { label: 'SLA issues', value: String(pack.sla_overdue) },
          { label: 'Pipeline (weighted)', value: fmt(Math.round(pack.pipeline_value)) },
        ].map((k) => (
          <div
            key={k.label}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div className="text-[10px] uppercase font-bold text-slate-500">{k.label}</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-3 border-b border-slate-100 dark:border-slate-700 text-xs font-bold">
          Top arrears accounts
        </div>
        {pack.top_arrears.length === 0 ? (
          <p className="p-4 text-xs text-slate-500">No arrears — collections are current.</p>
        ) : (
          <table className="w-full text-xs">
            <thead className="text-slate-500 bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="p-2 text-left">Tenant</th>
                <th className="p-2 text-left">Unit</th>
                <th className="p-2 text-left">Arrears</th>
                <th className="p-2 text-left">Aging</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {pack.top_arrears.map((r) => (
                <tr key={r.tenant_id}>
                  <td className="p-2 font-semibold">{r.business_name}</td>
                  <td className="p-2">{r.shop_number}</td>
                  <td className="p-2 text-red-600 font-bold">{fmt(r.arrears)}</td>
                  <td className="p-2">{r.aging_bucket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

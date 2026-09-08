import React, { useMemo, useState } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Building,
  Ticket,
  DollarSign,
  Activity,
} from 'lucide-react';
import { intelligence } from '../../services/intelligenceService';
import { auth } from '../../services/auth';

function fmt(n: number) {
  return `E${n.toLocaleString('en-SZ', { maximumFractionDigits: 0 })}`;
}

export const PortfolioIntelligenceView: React.FC<{ onViewTicket?: (id: string) => void }> = ({
  onViewTicket,
}) => {
  const user = auth.getCurrentUser();
  const orgId = user?.role === 'super_admin' ? undefined : user?.organization_id;
  const [tick, setTick] = useState(0);
  const kpis = useMemo(() => intelligence.getPortfolioKpis(orgId), [orgId, tick]);

  const healthColor =
    kpis.health_score >= 80 ? 'text-emerald-500' : kpis.health_score >= 60 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Portfolio Intelligence
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live KPIs, health score, and anomaly detection from operational and commercial data.
          </p>
        </div>
        <button
          onClick={() => setTick((t) => t + 1)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
        >
          Refresh insights
        </button>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-blue-200 font-bold">Portfolio health</div>
          <div className={`text-4xl font-extrabold mt-1 ${healthColor}`}>{kpis.health_score}</div>
          <p className="text-xs text-blue-100 mt-1">
            Weighted from occupancy, SLA compliance, collections, and open-ticket pressure
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-blue-200">SLA compliance</div>
            <div className="text-lg font-bold">{kpis.sla_compliance_pct}%</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-blue-200">Collection rate</div>
            <div className="text-lg font-bold">{kpis.collection_rate}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Building, label: 'Occupancy', value: `${kpis.occupancy_rate}%`, sub: `${kpis.units_occupied}/${kpis.units_total}` },
          { icon: DollarSign, label: 'Rent roll', value: fmt(kpis.monthly_rent_roll), sub: `Arrears ${fmt(kpis.arrears_total)}` },
          { icon: Ticket, label: 'Open tickets', value: String(kpis.open_tickets), sub: `${kpis.emergency_open} emergency` },
          { icon: Activity, label: 'Avg resolve', value: kpis.avg_resolution_hours != null ? `${kpis.avg_resolution_hours}h` : '—', sub: 'Closed tickets' },
        ].map((c) => (
          <div key={c.label} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500">
              <c.icon className="w-3.5 h-3.5" /> {c.label}
            </div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{c.value}</div>
            <div className="text-[10px] text-slate-400">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Tickets by category
          </h2>
          <div className="space-y-2">
            {Object.entries(kpis.tickets_by_category)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([cat, n]) => (
                <div key={cat} className="flex items-center gap-2 text-xs">
                  <span className="w-28 truncate text-slate-600 dark:text-slate-300">{cat}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (n / Math.max(...Object.values(kpis.tickets_by_category), 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="font-bold w-6 text-right">{n}</span>
                </div>
              ))}
            {!Object.keys(kpis.tickets_by_category).length && (
              <p className="text-xs text-slate-500">No ticket data yet.</p>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Anomalies & alerts
          </h2>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {kpis.anomalies.length === 0 && (
              <li className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> No anomalies detected
              </li>
            )}
            {kpis.anomalies.map((a) => (
              <li
                key={a.id}
                className={`p-2.5 rounded-xl text-xs border ${
                  a.severity === 'critical'
                    ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900'
                    : a.severity === 'warning'
                    ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900'
                    : 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-700'
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-white">{a.title}</div>
                <div className="text-slate-600 dark:text-slate-400 mt-0.5">{a.detail}</div>
                {a.entity_type === 'Ticket' && a.entity_id && onViewTicket && (
                  <button
                    onClick={() => onViewTicket(a.entity_id!)}
                    className="mt-1 text-blue-600 font-semibold text-[10px]"
                  >
                    Open ticket →
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

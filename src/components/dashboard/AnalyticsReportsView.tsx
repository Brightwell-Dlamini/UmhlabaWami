import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Building,
  Users,
  Ticket,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Store,
  DollarSign,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { getPlatformAnalytics } from '../../services/superAdminService';

function fmt(n: number) {
  return `E${n.toLocaleString()}`;
}

export const AnalyticsReportsView: React.FC = () => {
  const [downloadNotice, setDownloadNotice] = useState('');
  const [, setTick] = useState(0);
  const user = auth.getCurrentUser();
  const isSuper = user?.role === 'super_admin';

  useEffect(() => {
    const unsub = db.subscribe(() => setTick((p) => p + 1));
    return () => unsub();
  }, []);

  const a = getPlatformAnalytics();

  const handleExportReport = () => {
    const csv =
      'Metric,Value\n' +
      `Total_Organisations,${a.total_organizations}\n` +
      `Active_Organisations,${a.active_organizations}\n` +
      `Pending_Approvals,${a.pending_organizations}\n` +
      `Platform_Users,${a.total_users}\n` +
      `Properties,${a.total_properties}\n` +
      `Units,${a.total_units}\n` +
      `Occupied_Units,${a.occupied_units}\n` +
      `Available_Units,${a.available_units}\n` +
      `Occupancy_Rate_Pct,${a.occupancy_rate}\n` +
      `Tenants,${a.total_tenants}\n` +
      `Open_Tickets,${a.open_tickets}\n` +
      `Overdue_Tickets,${a.overdue_tickets}\n` +
      `SLA_Compliance_Pct,${a.sla_compliance_pct}\n` +
      `Platform_MRR,${a.platform_mrr}\n` +
      `Portfolio_Rent_Roll,${a.portfolio_rent_roll}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Umhlaba_Wami_Platform_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadNotice('Live platform analytics exported.');
    setTimeout(() => setDownloadNotice(''), 3000);
  };

  const cards = [
    { label: 'Active organisations', value: String(a.active_organizations), sub: `${a.pending_organizations} pending`, icon: Layers, color: 'text-blue-600' },
    { label: 'Platform users', value: String(a.total_users), sub: `${a.total_tenants} tenants`, icon: Users, color: 'text-indigo-600' },
    { label: 'Units', value: String(a.total_units), sub: `${a.occupancy_rate}% occupancy`, icon: Store, color: 'text-emerald-600' },
    { label: 'Open tickets', value: String(a.open_tickets), sub: `${a.overdue_tickets} overdue / at risk`, icon: Ticket, color: 'text-amber-600' },
    { label: 'SLA compliance', value: `${a.sla_compliance_pct}%`, sub: `${a.resolved_tickets} resolved`, icon: CheckCircle2, color: 'text-teal-600' },
    { label: 'Platform MRR', value: fmt(a.platform_mrr), sub: `Rent roll ${fmt(a.portfolio_rent_roll)}`, icon: DollarSign, color: 'text-blue-700' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {isSuper ? 'Global Platform Analytics' : 'SLA Analytics & Reports'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live metrics from organisations, units, tickets, and billing — not sample data.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportReport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {downloadNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {downloadNotice}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{c.label}</span>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{c.value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" /> Orgs by subscription tier
          </h3>
          <div className="space-y-2 text-xs">
            {(['Starter', 'Professional', 'Enterprise'] as const).map((t) => (
              <div key={t} className="flex items-center justify-between">
                <span>{t}</span>
                <span className="font-bold">{a.orgs_by_tier[t]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" /> Recent organisations
          </h3>
          <div className="space-y-2 text-xs">
            {a.recent_orgs.length === 0 && <p className="text-slate-500">No organisations yet.</p>}
            {a.recent_orgs.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{o.company_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{o.organization_code}</div>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    o.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : o.status === 'Pending Approval'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {a.overdue_tickets > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          {a.overdue_tickets} ticket(s) are overdue or at risk across the platform.
        </div>
      )}
    </div>
  );
};

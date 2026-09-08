import React, { useMemo, useState } from 'react';
import { History, Download, Shield } from 'lucide-react';
import { intelligence } from '../../services/intelligenceService';
import { auth } from '../../services/auth';

export const ComplianceAuditView: React.FC = () => {
  const user = auth.getCurrentUser();
  const orgId = user?.role === 'super_admin' ? undefined : user?.organization_id;
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const logs = useMemo(
    () => intelligence.getAuditTrail({ organizationId: orgId, search, action }),
    [orgId, search, action]
  );

  const exportCsv = () => {
    const csv = intelligence.exportAuditCsv(logs.slice(0, 500));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `umhlaba-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Compliance Audit Trail
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable-style activity log for sensitive actions. Designed for POPIA-aware operational
            accountability in Eswatini.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs flex gap-2">
        <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-slate-600 dark:text-slate-300">
          <strong>POPIA note:</strong> Access to personal data (tenant contacts, staff identities) is
          limited by role. Export only what is required for legitimate operations or legal requests.
          Retention policies should be defined with your organisation’s compliance officer.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user, action, details…"
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
        />
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Filter action (e.g. LOGIN, ESCALATE)"
          className="sm:w-56 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 text-slate-500">
              <tr>
                <th className="p-2 font-semibold">Time</th>
                <th className="p-2 font-semibold">User</th>
                <th className="p-2 font-semibold">Action</th>
                <th className="p-2 font-semibold">Entity</th>
                <th className="p-2 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {logs.slice(0, 200).map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                  <td className="p-2 whitespace-nowrap text-slate-500">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2 font-semibold">{l.user_name}</td>
                  <td className="p-2 font-mono text-[10px]">{l.action}</td>
                  <td className="p-2">
                    {l.entity_type}
                    <span className="text-slate-400 font-mono text-[10px]"> {l.entity_id.slice(0, 12)}</span>
                  </td>
                  <td className="p-2 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {l.details || '—'}
                  </td>
                </tr>
              ))}
              {!logs.length && (
                <tr>
                  <td colSpan={5} className="p-4 text-slate-500">
                    No audit entries match filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

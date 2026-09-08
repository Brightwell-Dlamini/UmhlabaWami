import React, { useState } from 'react';
import { Shield, Clock, Save, CheckCircle2, RotateCcw } from 'lucide-react';
import { ops, OrgSlaMatrix } from '../../services/opsService';
import { auth } from '../../services/auth';
import { TicketPriority } from '../../types';

const PRIORITIES: TicketPriority[] = ['Emergency', 'High', 'Medium', 'Low'];

export const SlaConfigView: React.FC = () => {
  const user = auth.getCurrentUser();
  const orgId = user?.organization_id || 'org_gables_lifestyle';
  const [matrix, setMatrix] = useState<OrgSlaMatrix>(() => ops.getSlaMatrix(orgId));
  const [saved, setSaved] = useState(false);

  const updateRule = (
    priority: TicketPriority,
    field: 'response_minutes' | 'resolution_minutes' | 'escalate_after_minutes',
    value: number
  ) => {
    setMatrix((m) => ({
      ...m,
      rules: m.rules.map((r) => (r.priority === priority ? { ...r, [field]: value } : r)),
    }));
    setSaved(false);
  };

  const handleSave = () => {
    const next = ops.updateSlaMatrix(orgId, matrix.rules);
    setMatrix(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    const defaults = ops.getSlaMatrix('__defaults__');
    // Force defaults by rewriting with known defaults via update
    const rules = [
      { priority: 'Emergency' as const, response_minutes: 15, resolution_minutes: 120, escalate_after_minutes: 30 },
      { priority: 'High' as const, response_minutes: 60, resolution_minutes: 480, escalate_after_minutes: 120 },
      { priority: 'Medium' as const, response_minutes: 240, resolution_minutes: 1440, escalate_after_minutes: 480 },
      { priority: 'Low' as const, response_minutes: 1440, resolution_minutes: 4320, escalate_after_minutes: 2880 },
    ];
    setMatrix({ organization_id: orgId, rules, updated_at: new Date().toISOString() });
    setSaved(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Configurable SLA Matrix
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organisation-level response, resolution, and auto-escalation thresholds (minutes). Used when
            creating tickets and escalating jobs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset defaults
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white flex items-center gap-1.5 shadow"
          >
            <Save className="w-3.5 h-3.5" /> Save matrix
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> SLA matrix saved for this organisation.
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-left text-slate-500">
                <th className="p-3 font-semibold">Priority</th>
                <th className="p-3 font-semibold">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Response (mins)
                </th>
                <th className="p-3 font-semibold">Resolution (mins)</th>
                <th className="p-3 font-semibold">Escalate after (mins)</th>
                <th className="p-3 font-semibold">Human-readable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {PRIORITIES.map((p) => {
                const rule = matrix.rules.find((r) => r.priority === p)!;
                return (
                  <tr key={p} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                    <td className="p-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          p === 'Emergency'
                            ? 'bg-red-600 text-white'
                            : p === 'High'
                            ? 'bg-amber-500 text-white'
                            : p === 'Medium'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p}
                      </span>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={1}
                        value={rule.response_minutes}
                        onChange={(e) => updateRule(p, 'response_minutes', Number(e.target.value))}
                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={1}
                        value={rule.resolution_minutes}
                        onChange={(e) => updateRule(p, 'resolution_minutes', Number(e.target.value))}
                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={1}
                        value={rule.escalate_after_minutes}
                        onChange={(e) =>
                          updateRule(p, 'escalate_after_minutes', Number(e.target.value))
                        }
                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                      />
                    </td>
                    <td className="p-3 text-slate-500">
                      Respond in {rule.response_minutes < 60 ? `${rule.response_minutes}m` : `${(rule.response_minutes / 60).toFixed(1)}h`}{' '}
                      · Resolve in {(rule.resolution_minutes / 60).toFixed(1)}h · Escalate after{' '}
                      {(rule.escalate_after_minutes / 60).toFixed(1)}h if still unassigned
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        Last updated: {new Date(matrix.updated_at).toLocaleString()} · Changes apply to new escalations and
        vendor callouts immediately; existing open tickets keep their original deadlines until escalated.
      </p>
    </div>
  );
};

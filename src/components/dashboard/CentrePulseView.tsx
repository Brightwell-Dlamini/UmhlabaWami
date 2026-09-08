import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  Wrench,
  Users,
  Radio,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { ops } from '../../services/opsService';
import { auth } from '../../services/auth';
import { db } from '../../services/db';

interface CentrePulseViewProps {
  onViewTicket: (id: string) => void;
  onNavigate?: (tab: string) => void;
}

export const CentrePulseView: React.FC<CentrePulseViewProps> = ({ onViewTicket, onNavigate }) => {
  const user = auth.getCurrentUser();
  const orgId = user?.organization_id;
  const [pulse, setPulse] = useState(() => ops.getCentrePulse(orgId));

  useEffect(() => {
    const refresh = () => setPulse(ops.getCentrePulse(orgId));
    refresh();
    const unsub = db.subscribe(refresh);
    const interval = setInterval(refresh, 30000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [orgId]);

  const { counts } = pulse;

  return (
    <div className="space-y-6 pb-12">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                Centre Pulse · Live Operations
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display">Command Centre</h1>
            <p className="text-xs text-blue-100 mt-1">
              Emergencies, SLA breaches, dispatch pool, preventive due, and on-call coverage — one screen.
            </p>
          </div>
          <div className="text-xs bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
            Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { label: 'Open', value: counts.open, color: 'text-slate-900 dark:text-white' },
          { label: 'Emergency', value: counts.emergencies, color: 'text-red-600' },
          { label: 'SLA Overdue', value: counts.overdue, color: 'text-amber-600' },
          { label: 'Unassigned', value: counts.unassigned, color: 'text-blue-600' },
          { label: 'In Progress', value: counts.inProgress, color: 'text-indigo-600' },
          { label: 'Awaiting Tenant', value: counts.awaitingTenant, color: 'text-emerald-600' },
          { label: 'PM Overdue', value: counts.pmOverdue, color: 'text-orange-600' },
          { label: 'On-Call', value: counts.onCall, color: 'text-teal-600' },
        ].map((k) => (
          <div
            key={k.label}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center"
          >
            <div className={`text-xl font-extrabold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Emergencies */}
        <section className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Emergencies</h2>
          </div>
          {pulse.emergencies.length === 0 ? (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No active emergencies
            </p>
          ) : (
            <ul className="space-y-2">
              {pulse.emergencies.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => onViewTicket(t.id)}
                    className="w-full text-left p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 hover:border-red-400 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-red-700 dark:text-red-300">{t.ticket_number}</span>
                      <span className="text-[10px] font-bold text-red-600">{t.sla_status}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{t.title}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* SLA breaches */}
        <section className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">SLA Overdue / Escalated</h2>
          </div>
          {pulse.overdue.length === 0 ? (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> All open tickets within SLA
            </p>
          ) : (
            <ul className="space-y-2">
              {pulse.overdue.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => onViewTicket(t.id)}
                    className="w-full text-left p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 hover:border-amber-400 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-amber-800 dark:text-amber-300">{t.ticket_number}</span>
                      <span className="text-[10px] font-bold uppercase text-amber-700">{t.sla_status}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">{t.title}</div>
                    <div className="text-[10px] text-slate-500">{t.priority} · Due {new Date(t.resolution_deadline).toLocaleString()}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Today's priority queue */}
        <section className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Priority Job Queue</h2>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('manager_tickets')}
                className="text-[11px] text-blue-600 font-semibold flex items-center gap-0.5"
              >
                All tickets <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <ul className="space-y-1.5">
            {pulse.todayJobs.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => onViewTicket(t.id)}
                  className="w-full flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{t.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{t.ticket_number} · {t.status}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      t.priority === 'Emergency'
                        ? 'bg-red-600 text-white'
                        : t.priority === 'High'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    {t.priority}
                  </span>
                </button>
              </li>
            ))}
            {pulse.todayJobs.length === 0 && (
              <p className="text-xs text-slate-500">No open jobs — centre is clear.</p>
            )}
          </ul>
        </section>

        {/* On-call + PM + announcements */}
        <section className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">On-Call Coverage</h2>
            </div>
            {pulse.onCall.length === 0 ? (
              <p className="text-xs text-slate-500">No staff marked On-Call — set coverage in Roster.</p>
            ) : (
              <ul className="space-y-1">
                {pulse.onCall.map((s) => (
                  <li key={s.id} className="text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{s.staff_name}</span>
                    <span className="text-slate-500">{s.staff_role} · {s.shift_type}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Preventive Overdue</h2>
              </div>
              {onNavigate && (
                <button onClick={() => onNavigate('preventive')} className="text-[11px] text-blue-600 font-semibold">
                  Manage
                </button>
              )}
            </div>
            {pulse.pmOverdue.length === 0 ? (
              <p className="text-xs text-slate-500">No overdue preventive tasks.</p>
            ) : (
              <ul className="space-y-1">
                {pulse.pmOverdue.map((p) => (
                  <li key={p.id} className="text-xs text-orange-800 dark:text-orange-300 font-medium">
                    {p.title} <span className="text-slate-400">(due {p.next_due})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Broadcasts</h2>
            </div>
            {pulse.announcements.length === 0 ? (
              <p className="text-xs text-slate-500">No active announcements.</p>
            ) : (
              <ul className="space-y-1.5">
                {pulse.announcements.map((a) => (
                  <li key={a.id} className="text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">{a.title}</span>
                    <span className="text-slate-500"> — {a.message.slice(0, 80)}…</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-2">
        {onNavigate && (
          <>
            <button
              onClick={() => onNavigate('manager_tickets')}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white"
            >
              Tickets & SLAs
            </button>
            <button
              onClick={() => onNavigate('maintenance_ops')}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-amber-600 text-white"
            >
              Maintenance Ops
            </button>
            <button
              onClick={() => onNavigate('sla_config')}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
            >
              Configure SLAs
            </button>
            <button
              onClick={() => onNavigate('staff_schedule')}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
            >
              Roster
            </button>
          </>
        )}
      </div>
    </div>
  );
};

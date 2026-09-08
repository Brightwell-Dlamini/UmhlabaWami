import React, { useEffect, useState } from 'react';
import {
  Calendar,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  Wrench,
} from 'lucide-react';
import { ops, PreventiveTask } from '../../services/opsService';
import { auth } from '../../services/auth';
import { db } from '../../services/db';

export const PreventiveMaintenanceView: React.FC = () => {
  const user = auth.getCurrentUser();
  const orgId = user?.organization_id || 'org_gables_lifestyle';
  const [tasks, setTasks] = useState<PreventiveTask[]>(() => ops.listPreventive(orgId));
  const [notice, setNotice] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<PreventiveTask['frequency']>('Monthly');
  const [nextDue, setNextDue] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<PreventiveTask['category']>('General Facilities');

  useEffect(() => {
    const refresh = () => setTasks(ops.listPreventive(orgId));
    const unsub = db.subscribe(refresh);
    return () => unsub();
  }, [orgId]);

  const handleComplete = (task: PreventiveTask) => {
    ops.completePreventive(task.id, user?.name || 'Manager');
    setTasks(ops.listPreventive(orgId));
    setNotice(`Marked complete and rescheduled: ${task.title}`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    ops.addPreventive({
      organization_id: orgId,
      property_id: db.properties.find((p) => p.organization_id === orgId)?.id || db.properties[0]?.id || '',
      title: title.trim(),
      category,
      frequency,
      next_due: nextDue,
      assigned_to_name: user?.name,
    });
    setTasks(ops.listPreventive(orgId));
    setShowAdd(false);
    setTitle('');
    setNotice('Preventive task scheduled.');
    setTimeout(() => setNotice(''), 3000);
  };

  const statusStyle = (s: PreventiveTask['status']) => {
    if (s === 'Overdue') return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300';
    if (s === 'Due') return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300';
    if (s === 'Completed') return 'bg-emerald-100 text-emerald-800';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Preventive Maintenance Schedule
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Planned facilities work for Eswatini centres — generators, HVAC, fire, lifts — so reactive tickets drop.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow"
        >
          <PlusCircle className="w-4 h-4" /> Add schedule item
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusStyle(t.status)}`}>
                  {t.status}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{t.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t.category} · {t.frequency} · Next due {t.next_due}
                </p>
              </div>
              {t.status === 'Overdue' && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
            </div>
            {t.notes && <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{t.notes}</p>}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400">{t.assigned_to_name || 'Unassigned'}</span>
              <button
                onClick={() => handleComplete(t)}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-600 text-white flex items-center gap-1"
              >
                <Wrench className="w-3 h-3" /> Complete & reschedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white">Schedule preventive task</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Title *</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                  placeholder="e.g. Monthly fire hose reel inspection"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as PreventiveTask['frequency'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Bi-Annual">Bi-Annual</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Next due</label>
                  <input
                    type="date"
                    value={nextDue}
                    onChange={(e) => setNextDue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PreventiveTask['category'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                >
                  <option value="General Facilities">General Facilities</option>
                  <option value="Air Conditioning">Air Conditioning</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Security">Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl">
                  Save schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  Play,
  Check,
  Send,
  Calendar,
  Building,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { Ticket } from '../../types';

interface MaintenancePortalProps {
  onViewTicket: (ticketId: string) => void;
}

export const MaintenancePortal: React.FC<MaintenancePortalProps> = ({ onViewTicket }) => {
  const currentUser = auth.getCurrentUser();
  const [activeTab, setActiveTab] = useState<'my_jobs' | 'new_jobs' | 'completed'>('my_jobs');
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const refresh = () => {
      setTickets([...db.tickets]);
    };
    refresh();
    const unsub = db.subscribe(refresh);
    return () => unsub();
  }, []);

  // Filter jobs
  const myActiveJobs = tickets.filter(
    (t) => t.assigned_to === currentUser?.id && (t.status === 'In Progress' || t.status === 'Open' || t.status === 'Reopened')
  );
  const unassignedNewJobs = tickets.filter((t) => !t.assigned_to && t.status === 'Open');
  const completedJobs = tickets.filter(
    (t) => (t.assigned_to === currentUser?.id || !t.assigned_to) && (t.status === 'Resolved' || t.status === 'Closed')
  );

  const handleStartWork = (ticketId: string) => {
    if (!currentUser) return;
    db.startTicketWork(ticketId, currentUser.name);
  };

  const handleClaimJob = (ticketId: string) => {
    if (!currentUser) return;
    db.assignTicket(ticketId, currentUser.id, currentUser.name, currentUser.name);
    db.startTicketWork(ticketId, currentUser.name);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Technician Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white shadow-lg shadow-amber-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/20 text-amber-100">
              Mobile Maintenance Desk
            </span>
            <span className="text-xs text-amber-100">Eswatini Field Operations</span>
          </div>
          <h1 className="text-2xl font-bold font-display">
            Technician Job Queue: {currentUser?.name}
          </h1>
          <p className="text-xs text-amber-100">
            Real-time job dispatching, work logs and photo evidence completion
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-black/20 px-3 py-2 rounded-xl backdrop-blur-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-amber-200">Active Jobs</div>
            <div className="text-lg font-extrabold">{myActiveJobs.length}</div>
          </div>
          <div className="w-px h-8 bg-amber-400/30" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-amber-200">New Pool</div>
            <div className="text-lg font-extrabold">{unassignedNewJobs.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('my_jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'my_jobs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          My Assigned Jobs ({myActiveJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('new_jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'new_jobs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Unassigned Dispatch Pool ({unassignedNewJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'completed'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Completed Archive ({completedJobs.length})
        </button>
      </div>

      {/* Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === 'my_jobs'
          ? myActiveJobs
          : activeTab === 'new_jobs'
          ? unassignedNewJobs
          : completedJobs
        ).map((t) => {
          const shop = db.shops.find((s) => s.id === t.shop_id);
          const property = db.properties.find((p) => p.id === t.property_id);
          const center = db.shoppingCenters.find((c) => c.id === t.shopping_center_id);

          return (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 hover:border-blue-400 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                    {t.ticket_number}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.priority === 'Emergency'
                        ? 'bg-red-600 text-white'
                        : t.priority === 'High'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t.priority} Priority
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      {center?.name || 'Center'} • Unit {shop?.shop_number || 'G-14'} ({shop?.floor})
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {t.description}
                </p>

                {/* Location hint */}
                {t.exact_location_description && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Location inside shop: </strong>
                    {t.exact_location_description}
                  </div>
                )}

                {/* SLA target timer */}
                <div className="flex items-center justify-between text-[11px] p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-800 dark:text-blue-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>SLA Target: {new Date(t.resolution_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className="font-bold">{t.sla_status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                {activeTab === 'new_jobs' ? (
                  <button
                    onClick={() => handleClaimJob(t.id)}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Claim & Start Job
                  </button>
                ) : t.status === 'Open' ? (
                  <button
                    onClick={() => handleStartWork(t.id)}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Work</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onViewTicket(t.id)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Log Work & Resolve</span>
                  </button>
                )}

                <button
                  onClick={() => onViewTicket(t.id)}
                  className="py-2 px-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200 transition"
                >
                  Full Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

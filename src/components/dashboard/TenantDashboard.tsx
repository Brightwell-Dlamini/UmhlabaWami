import React, { useState, useEffect } from 'react';
import {
  Ticket as TicketIcon,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Phone,
  Shield,
  Megaphone,
  Calendar,
  Building,
  Download,
  FileBadge,
  Sparkles,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { Ticket, Announcement, Lease, SlaAgreement } from '../../types';

interface TenantDashboardProps {
  onOpenCreateTicket: () => void;
  onViewTicket: (ticketId: string) => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
  onOpenCreateTicket,
  onViewTicket,
}) => {
  const currentUser = auth.getCurrentUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [lease, setLease] = useState<Lease | null>(null);
  const [sla, setSla] = useState<SlaAgreement | null>(null);

  useEffect(() => {
    const refreshData = () => {
      const u = auth.getCurrentUser();
      if (!u) return;

      // Filter tickets for this tenant or shop
      const tenantTickets = db.tickets.filter(
        (t) => t.created_by_user_id === u.id || (u.shop_id && t.shop_id === u.shop_id)
      );
      setTickets(tenantTickets);

      // Announcements
      setAnnouncements(db.announcements.filter((a) => a.is_active));

      // Lease
      const userTenant = db.tenants.find((t) => t.user_id === u.id) || db.tenants[0];
      if (userTenant) {
        setLease(db.leases.find((l) => l.tenant_id === userTenant.id) || db.leases[0]);
        setSla(db.slaAgreements.find((s) => s.tenant_id === userTenant.id) || db.slaAgreements[0]);
      }
    };

    refreshData();
    const unsub = db.subscribe(refreshData);
    return () => unsub();
  }, []);

  const openTickets = tickets.filter((t) => t.status === 'Open');
  const inProgressTickets = tickets.filter((t) => t.status === 'In Progress');
  const awaitingConfirmationTickets = tickets.filter((t) => t.status === 'Resolved');
  const closedTickets = tickets.filter((t) => t.status === 'Closed');

  // Greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Tenant Portal
              </span>
              <span className="text-xs text-blue-200">Shop G-14 • Ground Floor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
              {greeting}, {currentUser?.name || 'Valued Tenant'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mt-1">
              The Gables Shopping Centre • Swazi Artisan Crafts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateTicket}
              className="px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-800 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Confirmation Alert if any ticket is resolved */}
      {awaitingConfirmationTickets.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                Action Required: {awaitingConfirmationTickets.length} Ticket Marked Resolved by Maintenance
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Please confirm if the repairs have fixed the problem, or reopen the ticket with notes.
              </p>
            </div>
          </div>
          <button
            onClick={() => onViewTicket(awaitingConfirmationTickets[0].id)}
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Review & Confirm
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Open Tickets</span>
            <TicketIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {openTickets.length}
          </div>
          <span className="text-[10px] text-slate-400">Awaiting technician pickup</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {inProgressTickets.length}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Technician on-site</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Awaiting Confirm</span>
            <AlertTriangle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {awaitingConfirmationTickets.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Fixed by technician</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Closed & Audited</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {closedTickets.length}
          </div>
          <span className="text-[10px] text-slate-400">100% SLA Compliant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Tickets List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              My Maintenance & Support Tickets
            </h2>
            <button
              onClick={onOpenCreateTicket}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Issue</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active tickets. Your unit is in top condition!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onViewTicket(t.id)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          {t.ticket_number}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : t.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : t.status === 'Closed'
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {t.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {t.priority} Priority
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {t.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Category: {t.category} • Created {new Date(t.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        View Details →
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        SLA: {t.sla_status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Center Announcements */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-blue-600" />
              <span>Center Management Announcements</span>
            </h3>

            <div className="space-y-2">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{a.title}</span>
                    <span className="text-[10px] text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{a.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Lease Summary, SLA & Emergency Contacts */}
        <div className="space-y-4">
          {/* Lease & SLA Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileBadge className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Commercial Lease & SLA
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Active
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500">Unit Number</span>
                <span className="font-bold text-slate-900 dark:text-white">Shop G-14 (Ground Floor)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500">Monthly Rent</span>
                <span className="font-bold text-slate-900 dark:text-white">E{lease?.rental_amount.toLocaleString() || '18,500'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500">Lease Expiry</span>
                <span className="font-semibold text-slate-900 dark:text-white">{lease?.end_date || '2027-12-31'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500">Renewal Window</span>
                <span className="font-semibold text-blue-600">60 Days Prior Notice</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Digital Signing</span>
                <span className="font-semibold text-emerald-600">Verified & Signed</span>
              </div>
            </div>

            {/* SLA Response Timelines */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1 text-[11px]">
              <div className="font-bold text-slate-800 dark:text-slate-200">Center SLA Targets:</div>
              <div className="flex justify-between text-slate-500">
                <span>Emergency Faults:</span>
                <span className="font-bold text-red-600">15 min response</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>High Priority:</span>
                <span className="font-bold text-amber-600">1 hour response</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Standard Routine:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">4 hours response</span>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Widget (Requirement #33) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Center Emergency Hotlines</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Center Security Desk</div>
                  <div className="text-[10px] text-slate-400">24/7 Patrol Control Room</div>
                </div>
                <a href="tel:+26824161000" className="text-xs font-bold text-blue-600 hover:underline">
                  +268 2416 1000
                </a>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Property Manager (Sipho)</div>
                  <div className="text-[10px] text-slate-400">On-site Management Office</div>
                </div>
                <a href="tel:+26876020001" className="text-xs font-bold text-blue-600 hover:underline">
                  +268 7602 0001
                </a>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Senior Tech (Bheki)</div>
                  <div className="text-[10px] text-slate-400">Electrical & Water Dispatch</div>
                </div>
                <a href="tel:+26876020003" className="text-xs font-bold text-blue-600 hover:underline">
                  +268 7602 0003
                </a>
              </div>

              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-between text-red-900 dark:text-red-200">
                <div>
                  <div className="font-bold">Eswatini Emergency Fire/Police</div>
                  <div className="text-[10px] text-red-600">National Emergency Lines</div>
                </div>
                <span className="text-xs font-black">999 / 933</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

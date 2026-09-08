import React, { useState, useEffect } from 'react';
import {
  Ticket as TicketIcon,
  Search,
  Filter,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
  ArrowUpDown,
  User,
  Building,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { Ticket, TicketPriority, TicketStatus } from '../../types';

interface TicketsListViewProps {
  onViewTicket: (ticketId: string) => void;
  onOpenCreateTicket: () => void;
  filterRole?: string;
}

export const TicketsListView: React.FC<TicketsListViewProps> = ({
  onViewTicket,
  onOpenCreateTicket,
  filterRole,
}) => {
  const currentUser = auth.getCurrentUser();
  const [tickets, setTickets] = useState<Ticket[]>(db.tickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  useEffect(() => {
    const refresh = () => {
      setTickets([...db.tickets]);
    };
    const unsub = db.subscribe(refresh);
    return () => unsub();
  }, []);

  // Filter based on user role and selected filters
  const displayedTickets = tickets.filter((t) => {
    // If tenant, only see own tickets
    if (currentUser?.role === 'tenant') {
      if (t.created_by_user_id !== currentUser.id && t.shop_id !== currentUser.shop_id) {
        return false;
      }
    }
    // If maintenance, see assigned jobs or all open jobs
    if (filterRole === 'maintenance_jobs' && currentUser?.role === 'maintenance') {
      if (t.assigned_to !== currentUser.id && t.status === 'Closed') {
        return false;
      }
    }
    if (filterRole === 'maintenance_completed') {
      if (t.status !== 'Closed' && t.status !== 'Resolved') {
        return false;
      }
    }

    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = t.ticket_number.toLowerCase().includes(q);
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchShop = (t.exact_location_description || '').toLowerCase().includes(q);
      if (!matchNumber && !matchTitle && !matchDesc && !matchShop) return false;
    }

    return true;
  });

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const emergencyCount = tickets.filter((t) => t.priority === 'Emergency' && t.status !== 'Closed').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Tickets & SLA Operations Desk
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track, assign, and resolve commercial maintenance requests with live SLA monitoring
          </p>
        </div>

        <button
          onClick={onOpenCreateTicket}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log New Ticket</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('Open')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusFilter === 'Open'
              ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">Open Tickets</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{openCount}</div>
        </div>

        <div
          onClick={() => setPriorityFilter('Emergency')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            priorityFilter === 'Emergency'
              ? 'bg-red-50 border-red-300 dark:bg-red-950/40 dark:border-red-700'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">Active Emergencies</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{emergencyCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('In Progress')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusFilter === 'In Progress'
              ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">In Progress</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Resolved')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusFilter === 'Resolved'
              ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">Resolved / Closed</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ticket #, description, shop number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Emergency">Emergency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Air Conditioning">Air Conditioning</option>
            <option value="Water Leak">Water Leak</option>
            <option value="Structural Damage">Structural</option>
            <option value="Security">Security</option>
          </select>

          {(statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('All');
                setPriorityFilter('All');
                setCategoryFilter('All');
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {displayedTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No tickets match your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {displayedTickets.map((t) => {
              const shop = db.shops.find((s) => s.id === t.shop_id);
              const prop = db.properties.find((p) => p.id === t.property_id);
              return (
                <div
                  key={t.id}
                  onClick={() => onViewTicket(t.id)}
                  className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {t.ticket_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.priority === 'Emergency'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            : t.priority === 'High'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                            : t.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {t.priority}
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
                      <span className="text-[10px] text-slate-400 font-medium">
                        {t.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {t.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span>Location: Unit {shop?.shop_number || 'N/A'} • {prop?.name || 'Commercial Center'}</span>
                      <span>•</span>
                      <span>Assigned: {t.assigned_to_name || 'Unassigned'}</span>
                      <span>•</span>
                      <span>Created {new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/60">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] font-semibold text-slate-500">SLA Performance</div>
                      <span
                        className={`text-[11px] font-bold ${
                          t.sla_status === 'Compliant'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : t.sla_status === 'Warning'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {t.sla_status}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-500 hover:text-blue-600 transition">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Ticket as TicketIcon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Star,
  PlusCircle,
  Megaphone,
  Radio,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { Ticket, Property, ShoppingCenter, TicketPriority, TicketStatus } from '../../types';

interface ManagerDashboardProps {
  onViewTicket: (ticketId: string) => void;
  onOpenCreateTicket: () => void;
  onOpenBroadcastModal: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  onViewTicket,
  onOpenCreateTicket,
  onOpenBroadcastModal,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>(db.tickets);
  const [properties, setProperties] = useState<Property[]>(db.properties);
  const [shoppingCenters, setShoppingCenters] = useState<ShoppingCenter[]>(db.shoppingCenters);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setTickets([...db.tickets]);
      setProperties([...db.properties]);
      setShoppingCenters([...db.shoppingCenters]);
    });
    return () => unsub();
  }, []);

  // Compute Metrics
  const totalUnits = db.shops.length;
  const occupiedUnits = db.shops.filter((s) => s.status === 'Occupied').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 80;

  const openTickets = tickets.filter((t) => t.status === 'Open');
  const emergencyTickets = tickets.filter((t) => t.priority === 'Emergency' && t.status !== 'Closed');
  const inProgressTickets = tickets.filter((t) => t.status === 'In Progress');
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved');
  const closedTickets = tickets.filter((t) => t.status === 'Closed');

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (
      searchQuery &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              Commercial Portfolio Tower
            </span>
            <span className="text-xs text-slate-500">The Gables & Mbabane Centers</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Property Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time multi-center maintenance tracking, tenant SLAs and occupancy overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBroadcastModal}
            className="px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 border border-red-200 dark:border-red-900/60 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Radio className="w-4 h-4 text-red-600 animate-pulse" />
            <span>Emergency Broadcast</span>
          </button>
          <button
            onClick={onOpenCreateTicket}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Portfolio Occupancy</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {occupancyRate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {occupiedUnits} of {totalUnits} Units Leased
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Open Tickets</div>
          <div className="text-2xl font-bold text-blue-600 font-display">
            {openTickets.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting technician pickup</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Emergency Faults</div>
          <div className="text-2xl font-bold text-red-600 font-display flex items-center gap-1">
            <span>{emergencyTickets.length}</span>
            {emergencyTickets.length > 0 && <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />}
          </div>
          <div className="text-[10px] text-red-600 font-medium mt-1">15 min SLA window</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Active Repairs</div>
          <div className="text-2xl font-bold text-amber-500 font-display">
            {inProgressTickets.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Technicians on-site</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Awaiting Confirm</div>
          <div className="text-2xl font-bold text-emerald-600 font-display">
            {resolvedTickets.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">Pending tenant review</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Tenant CSAT</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-1">
            <span>4.9</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">98% SLA Compliance</div>
        </div>
      </div>

      {/* Commercial Centers Overview Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Managed Shopping Centers & Commercial Buildings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shoppingCenters.map((sc) => {
            const scShops = db.shops.filter((s) => s.shopping_center_id === sc.id);
            const scOccupied = scShops.filter((s) => s.status === 'Occupied').length;
            const scOpenTickets = tickets.filter(
              (t) => t.shopping_center_id === sc.id && t.status !== 'Closed'
            ).length;

            return (
              <div
                key={sc.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-400 dark:hover:border-blue-700 transition space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={sc.image}
                    alt={sc.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {sc.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{sc.location}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Occupancy Rate</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {scShops.length > 0 ? Math.round((scOccupied / scShops.length) * 100) : 80}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{
                        width: `${scShops.length > 0 ? (scOccupied / scShops.length) * 100 : 80}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Active Tickets: <strong>{scOpenTickets}</strong></span>
                    <span>Units: <strong>{scShops.length}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tickets Control Tower Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Maintenance & SLA Control Tower
            </h2>
            <p className="text-xs text-slate-500">Live ticket pipeline with response timers</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <input
                type="text"
                placeholder="Search ticket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent focus:outline-none text-xs text-slate-900 dark:text-white w-28 sm:w-36"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Reopened">Reopened</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-2.5">Ticket ID</th>
                <th className="px-3 py-2.5">Unit & Center</th>
                <th className="px-3 py-2.5">Issue Summary</th>
                <th className="px-3 py-2.5">Priority</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Assigned Tech</th>
                <th className="px-3 py-2.5">SLA Target</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredTickets.map((t) => {
                const center = db.shoppingCenters.find((c) => c.id === t.shopping_center_id);
                const shop = db.shops.find((s) => s.id === t.shop_id);
                const tech = db.users.find((u) => u.id === t.assigned_to);

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition cursor-pointer"
                    onClick={() => onViewTicket(t.id)}
                  >
                    <td className="px-3 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {t.ticket_number}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        Unit {shop?.shop_number || 'G-14'}
                      </div>
                      <div className="text-[10px] text-slate-500">{center?.name || 'Center'}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900 dark:text-white max-w-xs truncate">
                        {t.title}
                      </div>
                      <div className="text-[10px] text-slate-500">{t.category}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.priority === 'Emergency'
                            ? 'bg-red-600 text-white'
                            : t.priority === 'High'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : t.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : t.status === 'Closed'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-slate-800 dark:text-slate-200">
                        {tech ? tech.name.split(' ')[0] : <span className="text-red-500 font-semibold">Unassigned</span>}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{new Date(t.resolution_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewTicket(t.id);
                        }}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Manage →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

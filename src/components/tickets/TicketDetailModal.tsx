import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Wrench,
  DollarSign,
  Star,
  Send,
  Camera,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  Building,
} from 'lucide-react';
import { Ticket, UserRole } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';

interface TicketDetailModalProps {
  ticketId: string | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticketId,
  onClose,
  onRefresh,
}) => {
  const [ticket, setTicket] = useState<Ticket | null>(
    ticketId ? db.tickets.find((t) => t.id === ticketId) || null : null
  );
  const currentUser = auth.getCurrentUser();

  // Tenant feedback state
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenInput, setShowReopenInput] = useState(false);

  // Tech resolve state
  const [repairNotes, setRepairNotes] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [hoursSpent, setHoursSpent] = useState('1.5');
  const [cost, setCost] = useState('450');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
  );

  // New comment state
  const [newComment, setNewComment] = useState('');

  // Assigned tech state for manager
  const [selectedTechId, setSelectedTechId] = useState(ticket?.assigned_to || '');

  useEffect(() => {
    if (!ticketId) return;
    const unsub = db.subscribe(() => {
      const found = db.tickets.find((t) => t.id === ticketId);
      if (found) setTicket({ ...found });
    });
    return () => unsub();
  }, [ticketId]);

  if (!ticketId || !ticket) return null;

  const property = db.properties.find((p) => p.id === ticket.property_id);
  const shop = db.shops.find((s) => s.id === ticket.shop_id);
  const tenant = db.tenants.find((t) => t.id === ticket.tenant_id);
  const technician = db.users.find((u) => u.id === ticket.assigned_to);

  // SLA calculations
  const now = new Date();
  const resDeadline = new Date(ticket.resolution_deadline);
  const diffMs = resDeadline.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const isBreached = diffMs < 0 && ticket.status !== 'Resolved' && ticket.status !== 'Closed';

  // Strict Tenant Resolution Confirmation (Requirement #16)
  const handleTenantConfirmFixed = () => {
    if (!currentUser) return;
    db.confirmTicketResolved(ticket.id, rating, feedback);
    if (onRefresh) onRefresh();
  };

  const handleTenantReopen = () => {
    if (!currentUser || !reopenReason) return;
    db.reopenTicket(ticket.id, reopenReason, currentUser.name);
    setShowReopenInput(false);
    if (onRefresh) onRefresh();
  };

  // Tech actions
  const handleTechStartWork = () => {
    if (!currentUser) return;
    db.startTicketWork(ticket.id, currentUser.name);
    if (onRefresh) onRefresh();
  };

  const handleTechResolve = () => {
    if (!currentUser) return;
    db.resolveTicket(ticket.id, {
      repair_notes: repairNotes || 'Completed repairs according to safety standards.',
      materials_used: materialsUsed || 'Standard replacement fittings & sealant',
      time_spent_hours: Number(hoursSpent),
      cost: Number(cost),
      after_images: [afterPhotoUrl],
      technician_name: currentUser.name,
    });
    if (onRefresh) onRefresh();
  };

  // Manager action: assign ticket
  const handleAssignTech = () => {
    if (!selectedTechId) return;
    const tech = db.users.find((u) => u.id === selectedTechId);
    if (tech && currentUser) {
      db.assignTicket(ticket.id, tech.id, tech.name, currentUser.name);
      if (onRefresh) onRefresh();
    }
  };

  // Add comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    db.addTicketComment(ticket.id, currentUser.id, currentUser.name, newComment.trim());
    setNewComment('');
  };

  const comments = db.ticketComments.filter((c) => c.ticket_id === ticket.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
              {ticket.ticket_number}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                ticket.status === 'Resolved'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : ticket.status === 'Closed'
                  ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  : ticket.status === 'Reopened'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  : ticket.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {ticket.status}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                ticket.priority === 'Emergency'
                  ? 'bg-red-600 text-white'
                  : ticket.priority === 'High'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {ticket.priority} Priority
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SLA Countdown Bar */}
        <div
          className={`px-6 py-2.5 flex items-center justify-between text-xs border-b ${
            isBreached
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300'
              : 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50 text-blue-800 dark:text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="font-semibold">
              SLA Resolution Status:{' '}
              {ticket.status === 'Closed' || ticket.status === 'Resolved'
                ? 'Completed on Schedule'
                : isBreached
                ? `Breached (${Math.abs(diffHours)} hrs overdue)`
                : `${diffHours > 0 ? `${diffHours} hours remaining` : 'Due soon'}`}
            </span>
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            Deadline: {new Date(ticket.resolution_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(ticket.resolution_deadline).toLocaleDateString()}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {ticket.title}
            </h2>
            <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                {property?.name} • Unit {shop?.shop_number}
              </span>
              <span>Category: <strong>{ticket.category}</strong></span>
              <span>Tenant: <strong>{tenant?.business_name}</strong></span>
              <span>Assigned Tech: <strong>{technician?.name || 'Unassigned'}</strong></span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Issue Description
            </div>
            <p className="leading-relaxed">{ticket.description}</p>
            {ticket.exact_location_description && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                <strong className="text-slate-900 dark:text-white">Exact Location: </strong>
                <span>{ticket.exact_location_description}</span>
              </div>
            )}
          </div>

          {/* Photos Side-by-Side (Before & After) */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Photo Evidence (Before & After Repairs)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Before Maintenance
                </span>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {ticket.before_images && ticket.before_images.length > 0 ? (
                    <img src={ticket.before_images[0]} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      No before photo attached
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  After Technician Repair
                </span>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {ticket.after_images && ticket.after_images.length > 0 ? (
                    <img src={ticket.after_images[0]} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      Pending resolution completion
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Technician Work Log if present */}
          {ticket.repair_notes && (
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-2 text-xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Technician Completion Report</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">{ticket.repair_notes}</p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60 text-[11px]">
                <div>
                  <span className="text-slate-500">Materials: </span>
                  <strong className="text-slate-900 dark:text-white">{ticket.materials_used || 'Standard'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Time Spent: </span>
                  <strong className="text-slate-900 dark:text-white">{ticket.time_spent_hours || 1} hrs</strong>
                </div>
                <div>
                  <span className="text-slate-500">Total Repair Cost: </span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">E{ticket.cost || 0}</strong>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* STRICT TENANT WORKFLOW CONFIRMATION ACTION (Requirement #16) */}
          {/* ==================================================================== */}
          {ticket.status === 'Resolved' && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-400 dark:border-blue-700 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Tenant Confirmation Required: Has the issue been fixed to your satisfaction?</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Per commercial platform policies, a ticket cannot be permanently closed without your verification.
              </p>

              {!showReopenInput ? (
                <div className="space-y-3">
                  {/* Star Rating */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rate Maintenance Service:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition"
                        >
                          <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Optional feedback: Quick and clean repair by technician!"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTenantConfirmFixed}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Yes, Issue is Fixed (Close Ticket)</span>
                    </button>

                    <button
                      onClick={() => setShowReopenInput(true)}
                      className="py-2.5 px-4 bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Issue NOT Fixed (Reopen)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900 space-y-3">
                  <div className="text-xs font-bold text-red-800 dark:text-red-300">
                    Specify why the problem is not fixed:
                  </div>
                  <textarea
                    rows={2}
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="e.g. The leak resumed as soon as water pressure returned this morning."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-red-300 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowReopenInput(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTenantReopen}
                      disabled={!reopenReason}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow transition"
                    >
                      Reopen Ticket to Manager
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* TECHNICIAN WORK ACTIONS */}
          {/* ==================================================================== */}
          {currentUser?.role === 'maintenance' && ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>Technician Operational Actions</span>
              </div>

              {ticket.status === 'Open' ? (
                <button
                  onClick={handleTechStartWork}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Accept Job & Mark In Progress
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Repair Notes
                      </label>
                      <input
                        type="text"
                        value={repairNotes}
                        onChange={(e) => setRepairNotes(e.target.value)}
                        placeholder="Replaced copper compression joint and tested pressure."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Materials Used
                      </label>
                      <input
                        type="text"
                        value={materialsUsed}
                        onChange={(e) => setMaterialsUsed(e.target.value)}
                        placeholder="15mm copper elbow, PTFE tape"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Time Spent (Hours)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={hoursSpent}
                        onChange={(e) => setHoursSpent(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Cost (Emalangeni E)
                      </label>
                      <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleTechResolve}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Job & Send to Tenant for Confirmation</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* PROPERTY MANAGER ACTIONS: ASSIGNMENT */}
          {/* ==================================================================== */}
          {(currentUser?.role === 'property_manager' || currentUser?.role === 'admin') && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Assign Technician: </span>
                <span className="text-slate-500">Allocate job to center maintenance team</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Technician --</option>
                  {db.users
                    .filter((u) => u.role === 'maintenance')
                    .map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} (Technician)
                      </option>
                    ))}
                </select>
                <button
                  onClick={handleAssignTech}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
                >
                  Assign
                </button>
              </div>
            </div>
          )}

          {/* Audit Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Complete Audit Trail Timeline
            </h4>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
              {ticket.timeline.map((item, idx) => (
                <div key={item.id || idx} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.description}</div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    by {item.actor_name} ({item.actor_role}) • {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Comments & Direct Chat Thread */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Ticket Discussion & Communication</span>
            </h4>

            <div className="space-y-2.5 mb-3 max-h-48 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-xs text-slate-400 py-2">No comments yet. Start the conversation below.</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white">{c.user_name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{c.comment}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type a message or update for this ticket..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

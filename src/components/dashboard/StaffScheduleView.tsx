import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Shield,
  Phone,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Edit3,
  Trash2,
  X,
  Filter,
} from 'lucide-react';
import { db } from '../../services/db';
import { StaffShift } from '../../types';

export const StaffScheduleView: React.FC = () => {
  const [shifts, setShifts] = useState<StaffShift[]>([...db.shifts]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShift, setEditingShift] = useState<StaffShift | null>(null);
  const [filterRole, setFilterRole] = useState<string>('All');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [staffName, setStaffName] = useState('');
  const [shiftType, setShiftType] = useState<StaffShift['shift_type']>('Morning (07:00-15:00)');
  const [staffRole, setStaffRole] = useState<StaffShift['staff_role']>('Maintenance');
  const [shiftStatus, setShiftStatus] = useState<StaffShift['status']>('Scheduled');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const refresh = () => setShifts([...db.shifts]);
    const unsub = db.subscribe(refresh);
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingShift(null);
    setStaffName('');
    setShiftType('Morning (07:00-15:00)');
    setStaffRole('Maintenance');
    setShiftStatus('Scheduled');
    setShiftDate(new Date().toISOString().slice(0, 10));
    setShowAddModal(true);
  };

  const openEditModal = (shift: StaffShift) => {
    setEditingShift(shift);
    setStaffName(shift.staff_name);
    setShiftType(shift.shift_type);
    setStaffRole(shift.staff_role);
    setShiftStatus(shift.status);
    setShiftDate(shift.date);
    setShowAddModal(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    if (editingShift) {
      const idx = db.shifts.findIndex((s) => s.id === editingShift.id);
      if (idx !== -1) {
        db.shifts[idx] = {
          ...db.shifts[idx],
          staff_name: staffName.trim(),
          staff_role: staffRole,
          shift_type: shiftType,
          status: shiftStatus,
          date: shiftDate,
        };
        db.saveToStorage();
        setSuccessMsg(`Shift for ${staffName} updated successfully!`);
      }
    } else {
      const newShift: StaffShift = {
        id: `shift_${Date.now()}`,
        organization_id: 'org_gables_lifestyle',
        property_id: 'prop_gables_retail',
        staff_id: `staff_${Date.now().toString().slice(-4)}`,
        staff_name: staffName.trim(),
        staff_role: staffRole,
        date: shiftDate,
        shift_type: shiftType,
        status: shiftStatus,
        notes: 'Scheduled via operations roster.',
      };
      db.shifts.unshift(newShift);
      db.saveToStorage();
      setSuccessMsg(`Shift for ${staffName} successfully scheduled!`);
    }

    setShifts([...db.shifts]);
    setTimeout(() => setSuccessMsg(''), 3000);
    setShowAddModal(false);
  };

  const handleDeleteShift = (shift: StaffShift) => {
    if (window.confirm(`Delete shift assignment for ${shift.staff_name}?`)) {
      const idx = db.shifts.findIndex((s) => s.id === shift.id);
      if (idx !== -1) {
        db.shifts.splice(idx, 1);
        db.saveToStorage();
        setShifts([...db.shifts]);
        setSuccessMsg(`Shift assignment removed.`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    }
  };

  const handleToggleStatus = (shift: StaffShift) => {
    const nextStatus: StaffShift['status'] =
      shift.status === 'Scheduled'
        ? 'On-Call'
        : shift.status === 'On-Call'
        ? 'Completed'
        : 'Scheduled';

    const idx = db.shifts.findIndex((s) => s.id === shift.id);
    if (idx !== -1) {
      db.shifts[idx].status = nextStatus;
      db.saveToStorage();
      setShifts([...db.shifts]);
      setSuccessMsg(`${shift.staff_name}'s status changed to ${nextStatus}.`);
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  const filteredShifts = shifts.filter((s) => {
    if (filterRole !== 'All' && s.staff_role !== filterRole) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Facilities & Security Staff Rostering
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Active daily shift schedules, on-call technicians, and emergency coverage
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Staff Shift</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* On-Call Emergency Highlights */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full">
              Today's 24/7 On-Call Facilities Tech
            </span>
            <h3 className="text-lg font-bold mt-1">Bheki Maseko (Senior Facilities Technician)</h3>
            <p className="text-xs text-blue-100">Master Riser Shutoff & HVAC Certified • Direct Hotline: +268 7633 4455</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-white/10 rounded-xl">
            SLA Response Target: 15 Minutes
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {['All', 'Maintenance', 'Security', 'Cleaning', 'Manager', 'Finance'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                filterRole === role
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {role} ({role === 'All' ? shifts.length : shifts.filter((s) => s.staff_role === role).length})
            </button>
          ))}
        </div>
      </div>

      {/* Shift Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Duty Roster</h2>
          <span className="text-xs text-slate-500 font-medium">Date: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {filteredShifts.map((s) => (
            <div
              key={s.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs shrink-0">
                  {s.staff_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{s.staff_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                      {s.staff_role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{s.shift_type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  onClick={() => handleToggleStatus(s)}
                  title="Click to toggle status: Scheduled -> On-Call -> Completed"
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition ${
                    s.status === 'On-Call'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ring-1 ring-amber-400'
                      : s.status === 'Completed'
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  {s.status} ↺
                </button>
                <span className="text-xs text-slate-400 font-mono hidden md:inline">{s.date}</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(s)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    title="Edit shift"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteShift(s)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    title="Remove shift"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingShift ? 'Edit Staff Shift' : 'Assign Staff Shift'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Staff Member Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sandile Dlamini"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role / Department
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as StaffShift['staff_role'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Security">Security</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Manager">Manager</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Shift Timing
                </label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value as StaffShift['shift_type'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Morning (07:00-15:00)">Morning (07:00-15:00)</option>
                  <option value="Afternoon (14:00-22:00)">Afternoon (14:00-22:00)</option>
                  <option value="Night (22:00-07:00)">Night (22:00-07:00)</option>
                  <option value="General (08:00-17:00)">General (08:00-17:00)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duty Status
                </label>
                <select
                  value={shiftStatus}
                  onChange={(e) => setShiftStatus(e.target.value as StaffShift['status'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="On-Call">On-Call (24/7 Hotline)</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  {editingShift ? 'Save Changes' : 'Assign Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

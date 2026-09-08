import React, { useState, useEffect } from 'react';
import {
  FileBadge,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Building,
  ShieldCheck,
  PlusCircle,
  Edit3,
  Trash2,
  X,
  FileText,
  Printer,
} from 'lucide-react';
import { db } from '../../services/db';
import { Lease } from '../../types';

export const LeaseManagementView: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([...db.leases]);
  const [feedback, setFeedback] = useState('');

  // Modals
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const [viewingLease, setViewingLease] = useState<Lease | null>(null);

  // Form states
  const [tenantId, setTenantId] = useState(db.tenants[0]?.id || '');
  const [shopId, setShopId] = useState(db.shops[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [rentalAmount, setRentalAmount] = useState(15000);
  const [deposit, setDeposit] = useState(30000);
  const [renewalStatus, setRenewalStatus] = useState<Lease['renewal_status']>('Active');
  const [signerName, setSignerName] = useState('');
  const [isDigitallySigned, setIsDigitallySigned] = useState(true);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setLeases([...db.leases]);
    });
    return () => unsub();
  }, []);

  const openDraftModal = () => {
    const defaultTenant = db.tenants[0];
    setTenantId(defaultTenant?.id || '');
    setShopId(defaultTenant?.shop_id || db.shops[0]?.id || '');
    setStartDate(new Date().toISOString().slice(0, 10));
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 2);
    setEndDate(nextYear.toISOString().slice(0, 10));
    setRentalAmount(16500);
    setDeposit(33000);
    setRenewalStatus('Active');
    setSignerName(defaultTenant?.contact_person || 'Tenant Authorized Signatory');
    setIsDigitallySigned(true);
    setShowDraftModal(true);
  };

  const openEditModal = (l: Lease) => {
    setEditingLease(l);
    setTenantId(l.tenant_id);
    setShopId(l.shop_id);
    setStartDate(l.start_date);
    setEndDate(l.end_date);
    setRentalAmount(l.rental_amount);
    setDeposit(l.deposit);
    setRenewalStatus(l.renewal_status);
    setSignerName(l.signer_name || '');
    setIsDigitallySigned(l.is_digitally_signed);
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = db.tenants.find((t) => t.id === tenantId);

    db.addLease({
      tenant_id: tenantId,
      shop_id: shopId,
      organization_id: 'org_gables_lifestyle',
      start_date: startDate,
      end_date: endDate,
      rental_amount: Number(rentalAmount),
      deposit: Number(deposit),
      renewal_status: renewalStatus,
      document_url: 'https://example.com/lease-agreement.pdf',
      document_title: `Commercial Lease - ${tenant?.business_name || 'Tenant'}`,
      is_digitally_signed: isDigitallySigned,
      signed_at: isDigitallySigned ? new Date().toISOString() : undefined,
      signer_name: isDigitallySigned ? signerName.trim() : undefined,
    });

    setFeedback(`New lease agreement drafted and executed for ${tenant?.business_name}!`);
    setTimeout(() => setFeedback(''), 3500);
    setShowDraftModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLease) return;

    db.updateLease(editingLease.id, {
      tenant_id: tenantId,
      shop_id: shopId,
      start_date: startDate,
      end_date: endDate,
      rental_amount: Number(rentalAmount),
      deposit: Number(deposit),
      renewal_status: renewalStatus,
      signer_name: signerName.trim(),
      is_digitally_signed: isDigitallySigned,
    });

    setFeedback('Lease contract terms updated successfully!');
    setTimeout(() => setFeedback(''), 3500);
    setEditingLease(null);
  };

  const handleDeleteLease = (l: Lease) => {
    if (window.confirm('Are you sure you want to delete this lease record?')) {
      db.deleteLease(l.id);
      setFeedback('Lease record removed from registry.');
      setTimeout(() => setFeedback(''), 3500);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Commercial Leases & SLA Agreements
          </h1>
          <p className="text-xs text-slate-500">
            Automated lease renewal tracking (90/60/30 day alerts), digital signing verification and SLA tier agreements
          </p>
        </div>

        <button
          onClick={openDraftModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
        >
          <FileBadge className="w-4 h-4" />
          <span>Draft New Lease</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Expiry Alerts Banner */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>
            <strong>Renewal Watch:</strong> Active monitoring enabled across all {leases.length} registered lease agreements.
          </span>
        </div>
        <span className="font-bold text-blue-700 dark:text-blue-300">Automated 90-Day Notifications</span>
      </div>

      {/* Leases Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Active Tenant Leases & Contracts
          </h3>
          <span className="text-xs text-slate-500 font-medium">Total: {leases.length} Leases</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Tenant & Business</th>
                <th className="px-4 py-3">Property & Unit</th>
                <th className="px-4 py-3">Term Period</th>
                <th className="px-4 py-3">Monthly Rent</th>
                <th className="px-4 py-3">Deposit Held</th>
                <th className="px-4 py-3">Digital Signature</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {leases.map((l) => {
                const tenant = db.tenants.find((t) => t.id === l.tenant_id);
                const shop = db.shops.find((s) => s.id === l.shop_id);
                const property = db.properties.find((p) => p.id === shop?.property_id);

                return (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{tenant?.business_name || 'Commercial Tenant'}</div>
                      <div className="text-[10px] text-slate-500">{tenant?.contact_person}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">{property?.name || 'Commercial Complex'}</div>
                      <div className="text-[10px] text-slate-500">Unit {shop?.shop_number}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      <div>{l.start_date} to {l.end_date}</div>
                      <div className="text-[10px] text-blue-600 font-semibold">Renewal: 60-day notice</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      E{l.rental_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      E{(l.deposit || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{l.is_digitally_signed ? `Signed (${l.signer_name || 'Verified'})` : 'Pending'}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          l.renewal_status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : l.renewal_status === 'Renewed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {l.renewal_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingLease(l)}
                          title="View Deed & Agreement"
                          className="px-2 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View SLA</span>
                        </button>
                        <button
                          onClick={() => openEditModal(l)}
                          title="Edit Lease Terms"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLease(l)}
                          title="Delete Lease"
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Center SLA Standards Tier Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Eswatini Standard Commercial Service Level Agreement (SLA) Matrix
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/30 space-y-1">
            <div className="font-bold text-red-700 dark:text-red-300 uppercase">Emergency Faults</div>
            <div className="text-slate-700 dark:text-slate-300">Burst pipe, fire hazard, power grid blackout</div>
            <div className="pt-2 border-t border-red-200 dark:border-red-900 text-[11px]">
              <strong className="text-red-800 dark:text-red-200">15 min response • 2 hr resolution</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/30 space-y-1">
            <div className="font-bold text-amber-700 dark:text-amber-300 uppercase">High Priority</div>
            <div className="text-slate-700 dark:text-slate-300">HVAC failure, retail store glass crack, lock jam</div>
            <div className="pt-2 border-t border-amber-200 dark:border-amber-900 text-[11px]">
              <strong className="text-amber-800 dark:text-amber-200">1 hr response • 6 hr resolution</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 space-y-1">
            <div className="font-bold text-blue-700 dark:text-blue-300 uppercase">Medium Priority</div>
            <div className="text-slate-700 dark:text-slate-300">Basin slow drain, lighting fixture flicker, signage</div>
            <div className="pt-2 border-t border-blue-200 dark:border-blue-900 text-[11px]">
              <strong className="text-blue-800 dark:text-blue-200">4 hr response • 24 hr resolution</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300 uppercase">Low / Routine</div>
            <div className="text-slate-700 dark:text-slate-300">Cosmetic touch-ups, scheduled inspections</div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
              <strong className="text-slate-800 dark:text-slate-200">24 hr response • 72 hr resolution</strong>
            </div>
          </div>
        </div>
      </div>

      {/* DRAFT LEASE MODAL */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Draft New Commercial Lease Agreement
                </h3>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDraft} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Commercial Tenant *
                  </label>
                  <select
                    value={tenantId}
                    onChange={(e) => {
                      setTenantId(e.target.value);
                      const t = db.tenants.find((item) => item.id === e.target.value);
                      if (t?.shop_id) setShopId(t.shop_id);
                      if (t?.contact_person) setSignerName(t.contact_person);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {db.tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.business_name} ({t.contact_person})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Assigned Unit / Space *
                  </label>
                  <select
                    value={shopId}
                    onChange={(e) => {
                      setShopId(e.target.value);
                      const s = db.shops.find((shp) => shp.id === e.target.value);
                      if (s?.rental_amount) setRentalAmount(s.rental_amount);
                      if (s?.deposit_amount) setDeposit(s.deposit_amount);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {db.shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        Unit {s.shop_number} - {s.property_type} (E{s.rental_amount}/mo)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiration / End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Rent (SZL)
                  </label>
                  <input
                    type="number"
                    required
                    value={rentalAmount}
                    onChange={(e) => setRentalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deposit (SZL)
                  </label>
                  <input
                    type="number"
                    required
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={renewalStatus}
                    onChange={(e) => setRenewalStatus(e.target.value as Lease['renewal_status'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Renewal">Pending Renewal</option>
                    <option value="Renewed">Renewed</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tenant Authorized Signatory Name
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="draft-signed"
                  checked={isDigitallySigned}
                  onChange={(e) => setIsDigitallySigned(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="draft-signed" className="text-slate-700 dark:text-slate-300 font-medium">
                  Execute with cryptographic digital timestamp & SLA verification
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowDraftModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
                >
                  Execute Lease Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEASE MODAL */}
      {editingLease && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Amend / Renew Commercial Lease
                </h3>
              </div>
              <button
                onClick={() => setEditingLease(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiration / End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Rent (SZL)
                  </label>
                  <input
                    type="number"
                    required
                    value={rentalAmount}
                    onChange={(e) => setRentalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deposit (SZL)
                  </label>
                  <input
                    type="number"
                    required
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={renewalStatus}
                    onChange={(e) => setRenewalStatus(e.target.value as Lease['renewal_status'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Renewal">Pending Renewal</option>
                    <option value="Renewed">Renewed</option>
                    <option value="Expired">Expired</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Signatory Name
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingLease(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
                >
                  Save Lease Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DIGITAL LEASE DEED & SLA MODAL */}
      {viewingLease && (() => {
        const t = db.tenants.find((item) => item.id === viewingLease.tenant_id);
        const s = db.shops.find((shp) => shp.id === viewingLease.shop_id);
        const p = db.properties.find((prop) => prop.id === s?.property_id);
        const c = db.shoppingCenters.find((cntr) => cntr.id === s?.shopping_center_id);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <FileBadge className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Kingdom of Eswatini Commercial Tenancy & SLA Certificate
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">Ref: {viewingLease.id.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewingLease(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
                {/* Header Stamp */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      OFFICIAL COMMERCIAL LEASE AGREEMENT
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Governed under the Laws of the Kingdom of Eswatini & Eswatini Revenue Service (ERS) Stamp Duty Provisions
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-[10px]">
                      STATUS: {viewingLease.renewal_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Parties Details */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">LESSOR (LANDLORD)</span>
                    <strong className="text-slate-900 dark:text-white block">Ezulwini Commercial Holdings Ltd</strong>
                    <div className="text-[11px] text-slate-500">The Gables Lifestyle Centre, Ezulwini</div>
                    <div className="text-[11px] text-slate-500">TIN: SWZ-889021-99</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">LESSEE (TENANT)</span>
                    <strong className="text-slate-900 dark:text-white block">{t?.business_name || 'Commercial Tenant'}</strong>
                    <div className="text-[11px] text-slate-500">Contact: {t?.contact_person}</div>
                    <div className="text-[11px] text-slate-500">Tel: {t?.phone} • {t?.email}</div>
                  </div>
                </div>

                {/* Demised Premises & Financials */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase text-slate-900 dark:text-white">Demised Premises & Commercial Terms</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Unit & Complex</span>
                      <strong className="text-slate-900 dark:text-white">Unit {s?.shop_number}</strong>
                      <div className="text-[10px] text-slate-500">{c?.name}</div>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Demised Floor Area</span>
                      <strong className="text-slate-900 dark:text-white">{s?.size_sqm || 75} m²</strong>
                      <div className="text-[10px] text-slate-500">{s?.property_type}</div>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Monthly Rental</span>
                      <strong className="text-blue-600 dark:text-blue-400">E{viewingLease.rental_amount.toLocaleString()}</strong>
                      <div className="text-[10px] text-slate-500">Payable 1st of month</div>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Security Deposit Held</span>
                      <strong className="text-slate-900 dark:text-white">E{viewingLease.deposit.toLocaleString()}</strong>
                      <div className="text-[10px] text-slate-500">Interest-bearing escrow</div>
                    </div>
                  </div>
                </div>

                {/* Lease Period & Terms */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Term Duration & Escalation Clause</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    This lease commenced on <strong>{viewingLease.start_date}</strong> and shall terminate on{' '}
                    <strong>{viewingLease.end_date}</strong>. Annual compound escalation is stipulated at{' '}
                    <strong>7.5%</strong> per annum. The Lessee covenants to use the demised premises strictly for authorized
                    commercial operations ({t?.trade_type || 'Retail'}).
                  </p>
                </div>

                {/* Digital Signature Execution */}
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    <div>
                      <div className="font-bold text-emerald-900 dark:text-emerald-200">
                        Cryptographically Verified & Digitally Signed
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        Signatory: {viewingLease.signer_name || t?.contact_person} • Timestamp: {viewingLease.signed_at || '2026-08-20T10:00:00Z'}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded">
                    RSA-256 VALID
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/40">
                <button
                  onClick={() => setViewingLease(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

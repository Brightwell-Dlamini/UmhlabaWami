import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Phone,
  Mail,
  Star,
  Shield,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  Building,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { db } from '../../services/db';
import { Vendor } from '../../types';

export const VendorsView: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([...db.vendors]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notice, setNotice] = useState('');

  // Modals
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [calloutVendor, setCalloutVendor] = useState<Vendor | null>(null);
  const [calloutUrgency, setCalloutUrgency] = useState<'Emergency' | 'High' | 'Routine'>('Emergency');
  const [calloutReason, setCalloutReason] = useState('Urgent commercial facility outage requiring certified technician');

  // Vendor Form state
  const [formData, setFormData] = useState({
    company_name: '',
    service_category: 'HVAC / Air Conditioning',
    contact_person: '',
    phone: '',
    email: '',
    contract_expiry: '2027-12-31',
    performance_rating: 4.8,
    status: 'Active' as Vendor['status'],
  });

  useEffect(() => {
    const refresh = () => setVendors([...db.vendors]);
    const unsub = db.subscribe(refresh);
    return () => unsub();
  }, []);

  const filteredVendors = vendors.filter((v) => {
    if (selectedCategory !== 'All' && v.service_category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = v.company_name.toLowerCase().includes(q);
      const matchCat = v.service_category.toLowerCase().includes(q);
      const matchPerson = v.contact_person.toLowerCase().includes(q);
      if (!matchComp && !matchCat && !matchPerson) return false;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setFormData({
      company_name: '',
      service_category: 'HVAC / Air Conditioning',
      contact_person: '',
      phone: '+268 ',
      email: '',
      contract_expiry: '2027-12-31',
      performance_rating: 4.8,
      status: 'Active',
    });
    setShowVendorModal(true);
  };

  const handleOpenEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      company_name: vendor.company_name,
      service_category: vendor.service_category,
      contact_person: vendor.contact_person,
      phone: vendor.phone,
      email: vendor.email,
      contract_expiry: vendor.contract_expiry,
      performance_rating: vendor.performance_rating,
      status: vendor.status,
    });
    setShowVendorModal(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name.trim() || !formData.contact_person.trim()) return;

    if (editingVendor) {
      db.updateVendor(editingVendor.id, {
        company_name: formData.company_name.trim(),
        service_category: formData.service_category,
        contact_person: formData.contact_person.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        contract_expiry: formData.contract_expiry,
        performance_rating: Number(formData.performance_rating),
        status: formData.status,
      });
      setNotice(`Vendor "${formData.company_name}" updated successfully.`);
    } else {
      db.addVendor({
        organization_id: 'org_gables_lifestyle',
        company_name: formData.company_name.trim(),
        service_category: formData.service_category,
        contact_person: formData.contact_person.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        assigned_property_ids: ['prop_gables_retail', 'prop_swazi_plaza_main'],
        contract_expiry: formData.contract_expiry,
        performance_rating: Number(formData.performance_rating),
        status: formData.status,
      });
      setNotice(`Contractor "${formData.company_name}" registered to facilities directory.`);
    }

    setShowVendorModal(false);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    if (window.confirm(`Are you sure you want to remove contractor "${vendor.company_name}"?`)) {
      db.deleteVendor(vendor.id);
      setNotice(`Contractor "${vendor.company_name}" removed from directory.`);
      setTimeout(() => setNotice(''), 3500);
    }
  };

  const handleSendCallout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calloutVendor) return;

    const slaMins = calloutUrgency === 'Emergency' ? 45 : calloutUrgency === 'High' ? 120 : 240;
    setNotice(
      `Emergency dispatch ticket issued to ${calloutVendor.company_name}. SLA response time target: ${slaMins} minutes. SMS & email dispatches sent.`
    );
    setCalloutVendor(null);
    setTimeout(() => setNotice(''), 4500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Approved Commercial Contractors & Vendors
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified Eswatini facilities contractors, SLA compliance agreements, and emergency contacts
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Contractor</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contractor name, category, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="All">All Categories</option>
          <option value="HVAC / Air Conditioning">HVAC / Air Conditioning</option>
          <option value="Elevators / Escalators">Elevators & Escalators</option>
          <option value="Commercial Plumbing">Commercial Plumbing</option>
          <option value="Fire Protection">Fire Protection</option>
          <option value="Electrical Services">Electrical Services</option>
        </select>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((v) => (
          <div
            key={v.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {v.service_category}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs font-bold">{v.performance_rating}</span>
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {v.company_name}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Contact: {v.contact_person}
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{v.phone}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{v.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditModal(v)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  title="Edit Vendor"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteVendor(v)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  title="Remove Vendor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setCalloutVendor(v)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3 text-amber-300" />
                <span>Callout Request</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT VENDOR MODAL */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingVendor ? 'Edit Facility Contractor' : 'Register New Contractor'}
                </h3>
              </div>
              <button
                onClick={() => setShowVendorModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Contractor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peak HVAC & Refrigeration Eswatini"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.service_category}
                    onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="HVAC / Air Conditioning">HVAC / Air Conditioning</option>
                    <option value="Elevators / Escalators">Elevators & Escalators</option>
                    <option value="Commercial Plumbing">Commercial Plumbing</option>
                    <option value="Fire Protection">Fire Protection</option>
                    <option value="Electrical Services">Electrical Services</option>
                    <option value="Security Systems">Security Systems</option>
                    <option value="Structural & Roofing">Structural & Roofing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Service Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as Vendor['status'] })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active SLA</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Contact Person *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thulani Dlamini"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / Hotline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+268 7600 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="service@peakhvac.co.sz"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contract Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.contract_expiry}
                    onChange={(e) => setFormData({ ...formData, contract_expiry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.performance_rating}
                    onChange={(e) =>
                      setFormData({ ...formData, performance_rating: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
                >
                  {editingVendor ? 'Save Changes' : 'Register Contractor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMERGENCY CALLOUT MODAL */}
      {calloutVendor && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-red-50 dark:bg-red-950/30">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  Dispatch Contractor Callout
                </h3>
              </div>
              <button
                onClick={() => setCalloutVendor(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendCallout} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {calloutVendor.company_name}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Category: {calloutVendor.service_category} • Contact: {calloutVendor.contact_person}
                </div>
                <div className="text-blue-600 font-mono text-xs mt-1">{calloutVendor.phone}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Urgency Level & SLA Target *
                </label>
                <select
                  value={calloutUrgency}
                  onChange={(e) =>
                    setCalloutUrgency(e.target.value as 'Emergency' | 'High' | 'Routine')
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Emergency">Level 1: Critical Emergency (45-min SLA)</option>
                  <option value="High">Level 2: Urgent Escalation (2-hour SLA)</option>
                  <option value="Routine">Level 3: Scheduled Service (4-hour SLA)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Reason / Work Scope *
                </label>
                <textarea
                  rows={3}
                  required
                  value={calloutReason}
                  onChange={(e) => setCalloutReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCalloutVendor(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <Clock className="w-4 h-4" />
                  <span>Dispatch Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

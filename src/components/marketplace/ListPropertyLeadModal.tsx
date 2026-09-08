import React, { useState } from 'react';
import { X, Building2, Send, CheckCircle2, Phone, Mail, User, MapPin } from 'lucide-react';
import { db } from '../../services/db';

interface ListPropertyLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegisterOrg: () => void;
}

export const ListPropertyLeadModal: React.FC<ListPropertyLeadModalProps> = ({
  isOpen,
  onClose,
  onOpenRegisterOrg,
}) => {
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('Shopping Center / Mall');
  const [location, setLocation] = useState('Ezulwini Valley');
  const [totalUnits, setTotalUnits] = useState('12');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+268 ');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Log lead
    db.logAudit(
      'lead-owner',
      ownerName,
      'CREATE',
      'ListingLead',
      propertyName,
      undefined,
      `Landlord lead received for "${propertyName}" (${location}, ${totalUnits} units)`
    );

    // Notify Super Admin
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: 'usr-super-1',
      role: 'super_admin',
      type: 'registration',
      title: 'New Commercial Property Lead',
      message: `${ownerName} submitted "${propertyName}" (${location}, ${totalUnits} units) to be listed on Umhlaba Wami. Contact: ${phone}`,
      link: '/super_approvals',
      read: false,
      created_at: new Date().toISOString(),
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                List Your Property on Umhlaba Wami
              </h3>
              <p className="text-xs text-slate-500">Reach prospective commercial tenants across Eswatini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">
              Listing Request Received!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              Thank you, {ownerName}. Our Eswatini commercial property team will reach out to inspect your units and activate your live marketplace presence.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
              <span>Looking for full operations, ticketing & rent roll management?</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegisterOrg();
                }}
                className="font-bold underline ml-2 shrink-0"
              >
                Register Portal Account →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Property or Center Name *
                </label>
                <input
                  type="text"
                  required
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. Malkerns Retail Hub"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Shopping Center / Mall">Shopping Center / Mall</option>
                  <option value="Office Park / Complex">Office Park / Complex</option>
                  <option value="Industrial Park / Warehouse">Industrial Park / Warehouse</option>
                  <option value="Stand-alone Commercial Building">Stand-alone Commercial Building</option>
                  <option value="Mixed-use Center">Mixed-use Commercial Center</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location (Eswatini) *
                </label>
                <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mbabane, Ezulwini, Manzini"
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Commercial Units
                </label>
                <input
                  type="number"
                  min={1}
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+268 7600 0000"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@property.sz"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Any specifics regarding vacant shops or requirements
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. We have 2 anchor stores and 3 vacant boutique units ready for occupancy."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Property Listing Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

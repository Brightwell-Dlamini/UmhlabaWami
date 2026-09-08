import React, { useState } from 'react';
import { X, Send, CheckCircle2, Building, Calendar, Phone, Mail, User, Briefcase } from 'lucide-react';
import { Shop, ShoppingCenter } from '../../types';
import { db } from '../../services/db';

interface PropertyEnquiryModalProps {
  shop: Shop | null;
  shoppingCenter?: ShoppingCenter;
  onClose: () => void;
}

export const PropertyEnquiryModal: React.FC<PropertyEnquiryModalProps> = ({
  shop,
  shoppingCenter,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+268 ');
  const [targetMoveIn, setTargetMoveIn] = useState('');
  const [intendedTrade, setIntendedTrade] = useState('Retail / Fashion');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!shop) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Add lead/message and dispatch notification to property manager
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: 'usr-pm-1', // Sipho Dlamini
      role: 'property_manager',
      type: 'registration',
      title: `New Space Enquiry: Unit ${shop.shop_number}`,
      message: `${name} (${businessName || 'Independent'}) enquired about Unit ${shop.shop_number} in ${shoppingCenter?.name}. Contact: ${phone}`,
      link: '/properties',
      read: false,
      created_at: new Date().toISOString(),
    });

    // Also add to audit log
    db.logAudit(
      'public-prospect',
      name,
      'CREATE',
      'Enquiry',
      shop.id,
      shop.organization_id,
      `Prospective tenant enquired about ${shop.shop_number} (${shoppingCenter?.name})`
    );

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
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Enquire About Unit {shop.shop_number}
            </h3>
            <p className="text-xs text-slate-500">
              {shoppingCenter?.name} • E{shop.rental_amount.toLocaleString()}/month
            </p>
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
              Enquiry Dispatched Successfully!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              Thank you, {name}. Your viewing request and business inquiry have been routed to the property manager at {shoppingCenter?.name}. They will contact you shortly via {phone}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sindi Mthembu"
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business / Trading Name
                </label>
                <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600">
                  <Briefcase className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Kingdom Boutique"
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number (Eswatini) *
                </label>
                <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600">
                  <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+268 7600 0000"
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600">
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sindi@business.sz"
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Intended Business Trade
                </label>
                <select
                  value={intendedTrade}
                  onChange={(e) => setIntendedTrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Retail / Apparel">Retail / Apparel & Shoes</option>
                  <option value="Restaurant / Cafe">Food / Cafe / Fast Food</option>
                  <option value="Pharmacy / Health">Pharmacy / Medical Practice</option>
                  <option value="Electronics / Tech">Electronics & IT Services</option>
                  <option value="Banking / Financial">Financial Services / ATM</option>
                  <option value="Hair & Beauty">Salon / Barbershop / Spa</option>
                  <option value="General Office">Consultancy / Corporate Office</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Move-in Date
                </label>
                <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="date"
                    value={targetMoveIn}
                    onChange={(e) => setTargetMoveIn(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Additional Questions or Special Requirements
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Can we request a viewing this Friday afternoon? Do you offer a fit-out rent-free period?"
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
                <span>Submit Space Enquiry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

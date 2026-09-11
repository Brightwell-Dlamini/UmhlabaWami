import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, Search, X, CheckCircle2 } from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { createTenantRemote, updateTenantRemote } from '../../services/orgDataService';
import type { Tenant } from '../../types';

export const TenantsListView: React.FC<{ onOpenCreateTicketForShop?: () => void }> = () => {
  const currentUser = auth.getCurrentUser();
  const orgId = currentUser?.organization_id;
  const [tenants, setTenants] = useState(
    [...db.tenants].filter((t) => !orgId || t.organization_id === orgId)
  );
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tradeType, setTradeType] = useState('Retail');
  const [shopId, setShopId] = useState('');

  useEffect(() => {
    return db.subscribe(() => {
      setTenants([...db.tenants].filter((t) => !orgId || t.organization_id === orgId));
    });
  }, [orgId]);

  const orgShops = db.shops.filter((s) => !orgId || s.organization_id === orgId);

  const filtered = tenants.filter(
    (t) =>
      !search ||
      t.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) {
      setNotice('Not linked to an organisation.');
      return;
    }
    if (!businessName.trim() || !contactPerson.trim() || !email.trim()) {
      setNotice('Business name, contact person and email are required.');
      return;
    }
    setSaving(true);
    const res = await createTenantRemote({
      organization_id: orgId,
      business_name: businessName.trim(),
      contact_person: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      trade_type: tradeType,
      shop_id: shopId || undefined,
    });
    setSaving(false);
    if (!res.success) {
      setNotice(res.error || 'Could not save tenant');
      return;
    }
    setNotice(`Tenant "${businessName}" saved to the database.`);
    setShowAdd(false);
    setBusinessName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Tenants Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">Stored in Supabase for your organisation.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Add tenant
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tenants"
          className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 w-full bg-white dark:bg-slate-900"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <div className="font-bold text-sm">{t.business_name}</div>
            <div className="text-[11px] text-slate-500">{t.contact_person}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {t.email} · {t.phone || '—'}
            </div>
            <div className="text-[10px] mt-2 font-semibold">{t.status || 'Active'}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full p-8 text-center text-sm text-slate-500 border border-dashed rounded-2xl">
            No tenants yet. Add your first tenant.
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70">
          <form
            onSubmit={(e) => void handleSave(e)}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-3 shadow-2xl"
          >
            <div className="flex justify-between">
              <h3 className="font-bold text-sm">Add tenant</h3>
              <button type="button" onClick={() => setShowAdd(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Business name *</label>
              <input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Contact person *</label>
              <input
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Email *</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Trade type</label>
              <input
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Unit (optional)</label>
              <select
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              >
                <option value="">— None —</option>
                {orgShops.map((s) => (
                  <option key={s.id} value={s.id}>
                    Unit {s.shop_number}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-blue-600 text-white"
            >
              {saving ? 'Saving…' : 'Save tenant'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

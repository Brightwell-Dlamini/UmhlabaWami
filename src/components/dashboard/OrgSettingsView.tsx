import React, { useState } from 'react';
import { Building2, Save, Key, CheckCircle2 } from 'lucide-react';
import { auth } from '../../services/auth';
import { db } from '../../services/db';
import { updateOrganizationBranding, changeOwnPassword } from '../../services/orgDataService';

export const OrgSettingsView: React.FC = () => {
  const currentOrg =
    auth.getCurrentOrganization() ||
    db.organizations.find((o) => o.id === auth.getCurrentUser()?.organization_id);

  const [companyName, setCompanyName] = useState(currentOrg?.company_name || '');
  const [address, setAddress] = useState(currentOrg?.address || '');
  const [email, setEmail] = useState(currentOrg?.email || '');
  const [phone, setPhone] = useState(currentOrg?.phone || '');
  const [brandColor, setBrandColor] = useState(currentOrg?.custom_branding_color || '#2563eb');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id) {
      setSaveNotice('No organisation loaded. Re-login and try again.');
      return;
    }
    setSaving(true);
    const res = await updateOrganizationBranding({
      orgId: currentOrg.id,
      company_name: companyName,
      address,
      email,
      phone,
      custom_branding_color: brandColor,
    });
    setSaving(false);
    setSaveNotice(res.success ? 'Settings saved to the database.' : res.error || 'Save failed');
    setTimeout(() => setSaveNotice(''), 4000);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setSaveNotice('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSaveNotice('Passwords do not match.');
      return;
    }
    const res = await changeOwnPassword(newPassword);
    if (!res.success) {
      setSaveNotice(res.error || 'Could not change password');
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    setSaveNotice('Your password was updated.');
    setTimeout(() => setSaveNotice(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" /> Branding & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">Saved to Supabase for your organisation.</p>
      </div>

      {saveNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex gap-2">
          <CheckCircle2 className="w-4 h-4" /> {saveNotice}
        </div>
      )}

      <form onSubmit={(e) => void handleSave(e)} className="space-y-4 text-xs">
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase">Company name</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase">Address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase">Brand colour</label>
          <input
            type="color"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            className="mt-1 h-10 w-20 rounded border"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save to database'}
        </button>
      </form>

      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-600" /> Change your password
        </h3>
        <p className="text-[11px] text-slate-500">
          Each user changes their own password here. Admin sets a temporary password when creating
          staff; staff should change it after first login.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Confirm</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleChangePassword()}
          className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900"
        >
          Update password
        </button>
      </div>
    </div>
  );
};

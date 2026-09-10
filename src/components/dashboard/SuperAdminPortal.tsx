import React, { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  CheckCircle2,
  XCircle,
  Building,
  Store,
  Users,
  Settings,
  History,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { approveOrganisation, rejectOrganisation } from '../../services/provisioning';
import { Organization, Shop } from '../../types';

interface SuperAdminPortalProps {
  initialTab?: string;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'organizations' | 'listings' | 'audit' | 'backup'>('approvals');
  const [organizations, setOrganizations] = useState<Organization[]>(db.organizations);
  const [shops, setShops] = useState<Shop[]>(db.shops);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    if (!initialTab) return;
    if (initialTab === 'super_approvals' || initialTab === 'approvals') setActiveTab('approvals');
    else if (initialTab === 'super_organizations' || initialTab === 'organizations') setActiveTab('organizations');
    else if (initialTab === 'super_listings' || initialTab === 'listings') setActiveTab('listings');
    else if (initialTab === 'audit_logs' || initialTab === 'audit') setActiveTab('audit');
    else if (initialTab === 'db_backup' || initialTab === 'backup') setActiveTab('backup');
  }, [initialTab]);

  const [customCode, setCustomCode] = useState('');
  const [customMonthlyFee, setCustomMonthlyFee] = useState<number | ''>('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setOrganizations([...db.organizations]);
      setShops([...db.shops]);
    });
    return () => unsub();
  }, []);

  const pendingOrgs = organizations.filter((o) => o.status === 'Pending Approval');
  const activeOrgs = organizations.filter((o) => o.status === 'Active');

  const handleApprove = async (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (!org) return;

    const code =
      customCode.trim() ||
      `${(org.company_name || 'ORG').slice(0, 3).toUpperCase()}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`;

    const admin = auth.getCurrentUser();
    setActionNotice('Approving organisation…');

    const result = await approveOrganisation(orgId, {
      organization_code: code,
      approved_by: admin?.name || admin?.email || 'Super Admin',
    });

    if (!result.success) {
      setActionNotice(result.error || 'Approval failed on the server.');
      setTimeout(() => setActionNotice(''), 5000);
      return;
    }

    try {
      if (admin) db.approveOrganization(orgId, admin.id, admin.name);
    } catch {
      /* local optional */
    }

    const finalCode = result.organization?.organization_code || code;
    setActionNotice(
      `"${org.company_name}" approved. Organisation code: ${finalCode}. Owner signs in with that code, their username, and the password set at registration.`
    );
    setCustomCode('');
    setCustomMonthlyFee('');
    setSelectedOrgId(null);
    setTimeout(() => setActionNotice(''), 8000);
  };

  const handleReject = async (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (!org) return;

    const result = await rejectOrganisation(
      orgId,
      'Incomplete documentation or unverified commercial registration.'
    );
    if (!result.success) {
      setActionNotice(result.error || 'Reject failed.');
      setTimeout(() => setActionNotice(''), 4000);
      return;
    }
    try {
      db.rejectOrganization(orgId, 'Incomplete documentation or unverified commercial registration.');
    } catch {
      /* optional */
    }
    setActionNotice(`Organization "${org.company_name}" marked as Rejected.`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleTogglePublic = (shopId: string, current: boolean) => {
    db.updateShop(shopId, { public_listing: !current });
  };

  const handleToggleFeatured = (shopId: string, current: boolean) => {
    db.updateShop(shopId, { public_featured: !current });
  };

  const handleStatusChange = (shopId: string, newStatus: string) => {
    db.updateShop(shopId, { status: newStatus as Shop['status'] });
  };

  const handleDownloadBackup = () => {
    const stateJson = db.exportStateJson();
    const blob = new Blob([stateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Umhlaba_Wami_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionNotice('System state backup JSON exported successfully.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(
          [
            ['approvals', 'Approvals'],
            ['organizations', 'Organisations'],
            ['listings', 'Listings'],
            ['audit', 'Audit'],
            ['backup', 'Backup'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {label}
            {id === 'approvals' && pendingOrgs.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">{pendingOrgs.length}</span>
            )}
          </button>
        ))}
      </div>

      {actionNotice && (
        <div className="p-3 text-xs rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionNotice}</span>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" /> Pending organisation applications
          </h3>
          {pendingOrgs.length === 0 && (
            <p className="text-xs text-slate-500">No pending applications.</p>
          )}
          {pendingOrgs.map((org) => (
            <div
              key={org.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{org.company_name}</div>
                  <div className="text-xs text-slate-500">{org.owner_name} · {org.email} · {org.phone}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{org.address}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Tier: {org.subscription_tier}
                    {org.monthly_fee_estimate != null && ` · Est. fee E${Number(org.monthly_fee_estimate).toLocaleString()}`}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Pending Approval</span>
              </div>

              {selectedOrgId === org.id && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Organisation code</label>
                    <input
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                      placeholder="Auto if blank"
                      className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Custom monthly fee (optional)</label>
                    <input
                      type="number"
                      value={customMonthlyFee}
                      onChange={(e) => setCustomMonthlyFee(e.target.value === '' ? '' : Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrgId(selectedOrgId === org.id ? null : org.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  {selectedOrgId === org.id ? 'Hide options' : 'Set code / fee'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleApprove(org.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => void handleReject(org.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'organizations' && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4" /> All organisations ({organizations.length})
          </h3>
          {organizations.map((org) => (
            <div key={org.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap justify-between gap-2">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{org.company_name}</div>
                <div className="text-slate-500 font-mono">{org.organization_code}</div>
              </div>
              <span className="font-semibold">{org.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Store className="w-4 h-4" /> Marketplace units
          </h3>
          {shops.length === 0 && <p className="text-xs text-slate-500">No units yet.</p>}
          {shops.slice(0, 50).map((shop) => (
            <div key={shop.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{shop.shop_number}</div>
                <div className="text-slate-500">{shop.status}</div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleTogglePublic(shop.id, !!shop.public_listing)} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  {shop.public_listing ? 'Public' : 'Private'}
                </button>
                <button type="button" onClick={() => handleToggleFeatured(shop.id, !!shop.public_featured)} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  {shop.public_featured ? 'Featured' : 'Feature'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="text-xs text-slate-500 space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4" /> Recent activity
          </h3>
          {db.activityLogs.slice(0, 40).map((log) => (
            <div key={log.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              {log.user_name}: {log.action} {log.entity_type}
            </div>
          ))}
          {db.activityLogs.length === 0 && <p>No activity logged yet.</p>}
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download backup JSON
          </button>
          <p className="text-xs text-slate-500">Exports the current client cache. Source of truth remains Supabase.</p>
        </div>
      )}
    </div>
  );
};

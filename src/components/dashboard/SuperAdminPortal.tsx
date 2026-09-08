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
    if (initialTab === 'super_approvals' || initialTab === 'approvals') {
      setActiveTab('approvals');
    } else if (initialTab === 'super_organizations' || initialTab === 'organizations') {
      setActiveTab('organizations');
    } else if (initialTab === 'super_listings' || initialTab === 'listings') {
      setActiveTab('listings');
    } else if (initialTab === 'audit_logs' || initialTab === 'audit') {
      setActiveTab('audit');
    } else if (initialTab === 'db_backup' || initialTab === 'backup') {
      setActiveTab('backup');
    }
  }, [initialTab]);

  // Approval config overrides
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

  const handleApprove = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (!org) return;

    // Generate unique code if not customized (e.g. SM3-070926)
    const code =
      customCode.trim() ||
      `${(org.company_name || 'ORG').slice(0, 3).toUpperCase()}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`;

    db.approveOrganization(orgId, {
      organization_code: code,
      custom_monthly_fee: typeof customMonthlyFee === 'number' ? customMonthlyFee : undefined,
    });

    setActionNotice(`Organization "${org.company_name}" successfully approved! Code: ${code}`);
    setCustomCode('');
    setCustomMonthlyFee('');
    setSelectedOrgId(null);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleReject = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (!org) return;

    db.rejectOrganization(orgId, 'Incomplete documentation or unverified commercial registration.');
    setActionNotice(`Organization "${org.company_name}" marked as Rejected.`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  // Toggle listing flags
  const handleTogglePublic = (shopId: string, current: boolean) => {
    db.updateShop(shopId, { public_listing: !current });
  };

  const handleToggleFeatured = (shopId: string, current: boolean) => {
    db.updateShop(shopId, { public_featured: !current });
  };

  const handleStatusChange = (shopId: string, newStatus: any) => {
    db.updateShop(shopId, { status: newStatus });
  };

  // Backup state
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

  const handleResetData = () => {
    if (confirm('Reset Umhlaba Wami to fresh initial seed data?')) {
      db.resetToInitialSeed();
      setActionNotice('Database restored to initial seed state.');
      setTimeout(() => setActionNotice(''), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Super Admin Top Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-800 via-slate-900 to-slate-950 text-white shadow-xl shadow-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-400/30">
              Super Admin Console
            </span>
            <span className="text-xs text-slate-300">Kingdom of Eswatini Platform Governance</span>
          </div>
          <h1 className="text-2xl font-bold font-display">
            Multi-Tenant Administration & Listings Governance
          </h1>
          <p className="text-xs text-slate-300">
            Review landlord registration requests, override marketplace vacancies and audit platform logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadBackup}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition flex items-center gap-1.5"
            title="Download complete database state"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={handleResetData}
            className="px-3 py-2 bg-red-600/60 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="Restore initial seed state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition relative ${
            activeTab === 'approvals'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Pending Org Approvals</span>
          {pendingOrgs.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">
              {pendingOrgs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('organizations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'organizations'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Organizations ({organizations.length})
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'listings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Marketplace Vacancies & Overrides ({shops.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          System Audit Trail
        </button>
      </div>

      {/* APPROVALS TAB */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {pendingOrgs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-900 dark:text-white">All Organizations Reviewed</div>
              <p>There are no pending commercial landlord registrations at this time.</p>
            </div>
          ) : (
            pendingOrgs.map((org) => (
              <div
                key={org.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-700 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {org.company_name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                        Pending Approval
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Managing Owner: {org.owner_name} • {org.email} • {org.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500">Requested Tier: </span>
                    <strong className="text-xs text-blue-600">{org.subscription_tier}</strong>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      Est. Fee: E{org.monthly_fee_estimate?.toLocaleString() || '4,500'}/mo
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                    <span className="text-[10px] text-slate-500">Property Limit</span>
                    <div className="font-bold text-slate-900 dark:text-white">{org.property_limit} Properties</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                    <span className="text-[10px] text-slate-500">Tenant Capacity</span>
                    <div className="font-bold text-slate-900 dark:text-white">{org.tenant_limit} Tenants</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                    <span className="text-[10px] text-slate-500">Staff Logins</span>
                    <div className="font-bold text-slate-900 dark:text-white">{org.user_limit} Staff</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                    <span className="text-[10px] text-slate-500">Cloud Storage</span>
                    <div className="font-bold text-slate-900 dark:text-white">{org.storage_limit} GB</div>
                  </div>
                </div>

                {/* Approval inputs */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Assign Org Code (Auto if blank)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. EZU-002"
                        value={selectedOrgId === org.id ? customCode : ''}
                        onChange={(e) => {
                          setSelectedOrgId(org.id);
                          setCustomCode(e.target.value.toUpperCase());
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Custom Monthly Fee (E)
                      </label>
                      <input
                        type="number"
                        placeholder={`${org.monthly_fee_estimate || 4500}`}
                        value={selectedOrgId === org.id ? customMonthlyFee : ''}
                        onChange={(e) => {
                          setSelectedOrgId(org.id);
                          setCustomMonthlyFee(e.target.value ? Number(e.target.value) : '');
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleReject(org.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApprove(org.id)}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Issue Code</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ORGANIZATIONS TAB */}
      {activeTab === 'organizations' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Registered Commercial Portfolios & Landlords
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Org Code</th>
                  <th className="px-4 py-3">Company & Owner</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Monthly Billing</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {org.organization_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{org.company_name}</div>
                      <div className="text-[10px] text-slate-500">{org.owner_name} • {org.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {org.subscription_tier}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      E{(org.monthly_fee_estimate || 4500).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          org.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {org.approved_by || 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LISTINGS & VACANCY OVERRIDES TAB */}
      {activeTab === 'listings' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Public Marketplace Listing Overrides
            </h3>
            <p className="text-xs text-slate-500">
              Super Admin control to toggle marketplace visibility, homepage featured status, or override vacancy state.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2.5">Unit #</th>
                  <th className="px-3 py-2.5">Space Type</th>
                  <th className="px-3 py-2.5">Center</th>
                  <th className="px-3 py-2.5">Monthly Rent</th>
                  <th className="px-3 py-2.5">Vacancy Status</th>
                  <th className="px-3 py-2.5">Marketplace Visible</th>
                  <th className="px-3 py-2.5">Homepage Featured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {shops.map((shop) => {
                  const sc = db.shoppingCenters.find((c) => c.id === shop.shopping_center_id);

                  return (
                    <tr key={shop.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                      <td className="px-3 py-3 font-bold text-slate-900 dark:text-white">
                        Unit {shop.shop_number}
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                        {shop.property_type} ({shop.size_sqm} sqm)
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-900 dark:text-white">
                        {sc?.name || 'Center'}
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-900 dark:text-white">
                        E{shop.rental_amount.toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={shop.status}
                          onChange={(e) => handleStatusChange(shop.id, e.target.value)}
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        >
                          <option value="Available">Available (Vacant)</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Under Maintenance">Under Maintenance</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => handleTogglePublic(shop.id, shop.public_listing)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            shop.public_listing
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {shop.public_listing ? 'Published Live' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => handleToggleFeatured(shop.id, shop.public_featured)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            shop.public_featured
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {shop.public_featured ? '⭐ Featured' : 'Standard'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-600" />
                <span>Immutable System Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-500">
                Real-time chronological log of authentication, ticket status changes and administrative operations
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {db.activityLogs.length} Records Logged
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-96 overflow-y-auto">
            {db.activityLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {log.user_name}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {log.details}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

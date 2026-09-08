import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Building,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  Building2,
  DollarSign,
} from 'lucide-react';
import { db } from '../../services/db';
import { Tenant, Shop, Lease } from '../../types';

interface TenantsListViewProps {
  onSelectTenant?: (tenant: Tenant) => void;
  onOpenCreateTicketForShop?: (shopId: string) => void;
  onViewLeases?: () => void;
}

export const TenantsListView: React.FC<TenantsListViewProps> = ({
  onSelectTenant,
  onOpenCreateTicketForShop,
  onViewLeases,
}) => {
  const [tenants, setTenants] = useState<Tenant[]>(db.tenants);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCenter, setSelectedCenter] = useState('All');
  const [feedback, setFeedback] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Form states for add/edit
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tradeType, setTradeType] = useState('Retail & Fashion');
  const [centerId, setCenterId] = useState(db.shoppingCenters[0]?.id || '');
  const [shopId, setShopId] = useState('');
  const [tenantStatus, setTenantStatus] = useState<Tenant['status']>('Active');

  useEffect(() => {
    const refresh = () => setTenants([...db.tenants]);
    const unsub = db.subscribe(refresh);
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setBusinessName('');
    setContactPerson('');
    setPhone('+268 ');
    setEmail('');
    setTradeType('Retail & Fashion');
    const firstCenter = db.shoppingCenters[0]?.id || '';
    setCenterId(firstCenter);
    const availableShops = db.shops.filter((s) => s.shopping_center_id === firstCenter);
    setShopId(availableShops[0]?.id || '');
    setTenantStatus('Active');
    setShowAddModal(true);
  };

  const openEditModal = (t: Tenant) => {
    setEditingTenant(t);
    setBusinessName(t.business_name);
    setContactPerson(t.contact_person);
    setPhone(t.phone);
    setEmail(t.email);
    setTradeType(t.trade_type);
    setCenterId(t.shopping_center_id);
    setShopId(t.shop_id);
    setTenantStatus(t.status);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactPerson.trim()) return;

    const property = db.properties.find((p) => p.shopping_center_id === centerId) || db.properties[0];

    db.addTenant({
      organization_id: 'org_gables_lifestyle',
      property_id: property?.id || 'prop_gables_retail',
      shopping_center_id: centerId,
      shop_id: shopId || db.shops[0]?.id,
      business_name: businessName.trim(),
      contact_person: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status: tenantStatus,
      trade_type: tradeType,
      move_in_date: new Date().toISOString().slice(0, 10),
    });

    setFeedback(`Tenant "${businessName}" successfully registered & unit allocated!`);
    setTimeout(() => setFeedback(''), 3500);
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant || !businessName.trim()) return;

    db.updateTenant(editingTenant.id, {
      business_name: businessName.trim(),
      contact_person: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      trade_type: tradeType,
      shopping_center_id: centerId,
      shop_id: shopId,
      status: tenantStatus,
    });

    setFeedback(`Tenant "${businessName}" details updated successfully!`);
    setTimeout(() => setFeedback(''), 3500);
    setEditingTenant(null);
  };

  const handleDeleteTenant = (t: Tenant) => {
    if (window.confirm(`Are you sure you want to remove tenant "${t.business_name}"? This will vacate the associated commercial unit.`)) {
      db.deleteTenant(t.id);
      setFeedback(`Tenant "${t.business_name}" removed and unit set to available.`);
      setTimeout(() => setFeedback(''), 3500);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (selectedCenter !== 'All' && t.shopping_center_id !== selectedCenter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.business_name.toLowerCase().includes(q);
      const matchPerson = t.contact_person.toLowerCase().includes(q);
      const matchPhone = t.phone.toLowerCase().includes(q);
      const matchEmail = t.email.toLowerCase().includes(q);
      if (!matchName && !matchPerson && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Commercial Tenants Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage commercial shop occupancies, lease terms, and communication channels
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onViewLeases && (
            <button
              onClick={onViewLeases}
              className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Manage Leases & SLAs</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Commercial Tenant</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 font-medium">Total Tenants</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{tenants.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 font-medium">Active & Current</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {tenants.filter((t) => t.status === 'Active').length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 font-medium">Occupancy Rate</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">94.8%</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 font-medium">Monthly Collections</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            E {tenants.reduce((acc, t) => {
              const s = db.shops.find((shp) => shp.id === t.shop_id);
              return acc + (s?.rental_amount || 15000);
            }, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tenant, business name, phone, or contact person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Properties</option>
            {db.shoppingCenters.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Notice Given">Notice Given</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Business / Tenant</th>
                <th className="py-3.5 px-4">Unit & Center</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Monthly Rent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredTenants.map((t) => {
                const shop = db.shops.find((s) => s.id === t.shop_id);
                const center = db.shoppingCenters.find((c) => c.id === t.shopping_center_id);
                const lease = db.leases.find((l) => l.tenant_id === t.id);

                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                    <td className="py-3.5 px-4 font-medium">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{t.business_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.contact_person}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[11px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        {shop?.shop_number || 'G-14'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{center?.name || 'The Gables'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {t.trade_type}
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{t.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate max-w-[160px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{t.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      E {(shop?.rental_amount || lease?.rental_amount || 15000).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(t)}
                          title="Edit Tenant Details"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {onOpenCreateTicketForShop && shop && (
                          <button
                            onClick={() => onOpenCreateTicketForShop(shop.id)}
                            className="px-2 py-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 rounded-lg transition"
                          >
                            Log Issue
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTenant(t)}
                          title="Vacate / Delete Tenant"
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

      {/* ADD TENANT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Register New Commercial Tenant
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business / Trading Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swazi Mobile HQ"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sipho Dlamini"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tenant@business.sz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Industry / Trade Category
                  </label>
                  <select
                    value={tradeType}
                    onChange={(e) => setTradeType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Retail & Fashion">Retail & Fashion</option>
                    <option value="Dining & Quick Service">Dining & Quick Service</option>
                    <option value="Financial Services & Banking">Financial Services & Banking</option>
                    <option value="Corporate Office">Corporate Office</option>
                    <option value="Healthcare & Pharmacy">Healthcare & Pharmacy</option>
                    <option value="Electronics & Tech">Electronics & Tech</option>
                    <option value="Supermarket / Groceries">Supermarket / Groceries</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lease Status
                  </label>
                  <select
                    value={tenantStatus}
                    onChange={(e) => setTenantStatus(e.target.value as Tenant['status'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending Move-in</option>
                    <option value="Notice Given">Notice Given</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shopping Center / Complex
                  </label>
                  <select
                    value={centerId}
                    onChange={(e) => {
                      const newC = e.target.value;
                      setCenterId(newC);
                      const matchingShops = db.shops.filter((s) => s.shopping_center_id === newC);
                      setShopId(matchingShops[0]?.id || '');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {db.shoppingCenters.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Unit / Shop #
                  </label>
                  <select
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {db.shops
                      .filter((s) => s.shopping_center_id === centerId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          Unit {s.shop_number} ({s.property_type} - {s.size_sqm}m² - E{s.rental_amount}/mo)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TENANT MODAL */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Edit Commercial Tenant Details
                </h3>
              </div>
              <button
                onClick={() => setEditingTenant(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business / Trading Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Industry / Trade Category
                  </label>
                  <input
                    type="text"
                    value={tradeType}
                    onChange={(e) => setTradeType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lease Status
                  </label>
                  <select
                    value={tenantStatus}
                    onChange={(e) => setTenantStatus(e.target.value as Tenant['status'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Notice Given">Notice Given</option>
                    <option value="Evicted">Evicted</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Store,
  MapPin,
  Maximize2,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  Filter,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  Globe,
  Tag,
} from 'lucide-react';
import { db } from '../../services/db';
import { Shop, UnitStatus, Property } from '../../types';

interface UnitsDirectoryViewProps {
  onSelectShop?: (shop: Shop) => void;
}

export const UnitsDirectoryView: React.FC<UnitsDirectoryViewProps> = ({
  onSelectShop,
}) => {
  const [shops, setShops] = useState<Shop[]>([...db.shops]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  // Form states
  const [shopNumber, setShopNumber] = useState('');
  const [centerId, setCenterId] = useState(db.shoppingCenters[0]?.id || '');
  const [propertyType, setPropertyType] = useState<Property['type']>('Retail shop');
  const [floor, setFloor] = useState('Ground Floor');
  const [sizeSqm, setSizeSqm] = useState(65);
  const [rentalAmount, setRentalAmount] = useState(14000);
  const [depositAmount, setDepositAmount] = useState(28000);
  const [status, setStatus] = useState<UnitStatus>('Available');
  const [publicListing, setPublicListing] = useState(true);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setShops([...db.shops]);
    });
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setShopNumber(`G-${Math.floor(20 + Math.random() * 30)}`);
    setCenterId(db.shoppingCenters[0]?.id || '');
    setPropertyType('Retail shop');
    setFloor('Ground Floor');
    setSizeSqm(75);
    setRentalAmount(16500);
    setDepositAmount(33000);
    setStatus('Available');
    setPublicListing(true);
    setDescription('High foot-traffic commercial unit with display frontage.');
    setShowAddModal(true);
  };

  const openEditModal = (shop: Shop) => {
    setEditingShop(shop);
    setShopNumber(shop.shop_number);
    setCenterId(shop.shopping_center_id);
    setPropertyType(shop.property_type);
    setFloor(shop.floor);
    setSizeSqm(shop.size_sqm);
    setRentalAmount(shop.rental_amount);
    setDepositAmount(shop.deposit_amount);
    setStatus(shop.status);
    setPublicListing(shop.public_listing);
    setDescription(shop.description || '');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopNumber.trim()) return;

    const property = db.properties.find((p) => p.shopping_center_id === centerId) || db.properties[0];

    db.addShop({
      organization_id: 'org_gables_lifestyle',
      property_id: property?.id || 'prop_gables_retail',
      shopping_center_id: centerId,
      shop_number: shopNumber.trim(),
      floor,
      size_sqm: Number(sizeSqm),
      rental_amount: Number(rentalAmount),
      deposit_amount: Number(depositAmount),
      status,
      public_listing: publicListing,
      qr_code: `SWZ-UNIT-${shopNumber.trim().toUpperCase()}`,
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
      ],
      features: ['Air Conditioning Ready', '3-Phase Power', 'Tile Flooring', 'Display Window'],
      property_type: propertyType,
      description: description.trim() || 'Modern commercial space in prime retail complex.',
    });

    setFeedback(`Unit ${shopNumber} successfully added to portfolio & marketplace!`);
    setTimeout(() => setFeedback(''), 3500);
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop || !shopNumber.trim()) return;

    db.updateShop(editingShop.id, {
      shop_number: shopNumber.trim(),
      shopping_center_id: centerId,
      property_type: propertyType,
      floor,
      size_sqm: Number(sizeSqm),
      rental_amount: Number(rentalAmount),
      deposit_amount: Number(depositAmount),
      status,
      public_listing: publicListing,
      description: description.trim(),
    });

    setFeedback(`Unit ${shopNumber} updated successfully!`);
    setTimeout(() => setFeedback(''), 3500);
    setEditingShop(null);
  };

  const handleDeleteShop = (shop: Shop) => {
    if (window.confirm(`Are you sure you want to delete Unit ${shop.shop_number}?`)) {
      db.deleteShop(shop.id);
      setFeedback(`Unit ${shop.shop_number} removed from directory.`);
      setTimeout(() => setFeedback(''), 3500);
    }
  };

  const handleToggleMarketplace = (shop: Shop) => {
    db.updateShop(shop.id, { public_listing: !shop.public_listing });
    setFeedback(
      `Unit ${shop.shop_number} ${!shop.public_listing ? 'listed on' : 'delisted from'} public marketplace.`
    );
    setTimeout(() => setFeedback(''), 3500);
  };

  const filteredShops = shops.filter((shop) => {
    if (selectedCenterId !== 'all' && shop.shopping_center_id !== selectedCenterId) return false;
    if (statusFilter !== 'all' && shop.status !== statusFilter) return false;
    if (
      search &&
      !shop.shop_number.toLowerCase().includes(search.toLowerCase()) &&
      !shop.property_type.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Commercial Units & Retail Spaces Directory
          </h1>
          <p className="text-xs text-slate-500">
            Real-time occupancy status, unit dimensions, and commercial leasing specifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search unit # or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-slate-900 dark:text-white w-32 sm:w-44"
            />
          </div>

          <select
            value={selectedCenterId}
            onChange={(e) => setSelectedCenterId(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          >
            <option value="all">All Centers</option>
            {db.shoppingCenters.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Unit</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShops.map((shop) => {
          const center = db.shoppingCenters.find((c) => c.id === shop.shopping_center_id);
          const tenant = db.tenants.find((t) => t.shop_id === shop.id);

          return (
            <div
              key={shop.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-400 dark:hover:border-blue-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-slate-900 dark:text-white">
                    Unit {shop.shop_number}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {shop.public_listing && (
                      <span
                        title="Listed on Public Marketplace"
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center gap-1"
                      >
                        <Globe className="w-2.5 h-2.5" />
                        Marketplace
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        shop.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : shop.status === 'Occupied'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {shop.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    {center?.name} • {shop.floor}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Space Type & Size</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {shop.property_type} ({shop.size_sqm} m²)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Monthly Rental</span>
                    <strong className="text-blue-600 dark:text-blue-400">
                      E{shop.rental_amount.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {tenant ? (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs">
                    <span className="text-[10px] text-slate-400 block">Current Tenant</span>
                    <div className="font-bold text-slate-900 dark:text-white">{tenant.business_name}</div>
                    <div className="text-[10px] text-slate-500">
                      {tenant.contact_person} • {tenant.phone}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center justify-between">
                    <span>Vacant & Available</span>
                    <button
                      onClick={() => handleToggleMarketplace(shop)}
                      className="text-[10px] font-bold underline hover:text-emerald-900"
                    >
                      {shop.public_listing ? 'Delist' : 'List on Web'}
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (typeof onSelectShop === 'function') {
                      onSelectShop(shop);
                    }
                  }}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <span>Unit Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => openEditModal(shop)}
                  title="Edit Unit Properties"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteShop(shop)}
                  title="Delete Unit"
                  className="p-2 rounded-xl border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD UNIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Add New Commercial Unit
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
                    Unit / Shop Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. G-25"
                    value={shopNumber}
                    onChange={(e) => setShopNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shopping Center / Building *
                  </label>
                  <select
                    value={centerId}
                    onChange={(e) => setCenterId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {db.shoppingCenters.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Space Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as Property['type'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Retail shop">Retail Shop</option>
                    <option value="Office">Commercial Office</option>
                    <option value="Restaurant">Restaurant / Food Court</option>
                    <option value="Kiosk">Concourse Kiosk</option>
                    <option value="Commercial unit">Commercial Unit</option>
                    <option value="Warehouse">Warehouse / Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floor Level
                  </label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Size (sqm)
                  </label>
                  <input
                    type="number"
                    required
                    value={sizeSqm}
                    onChange={(e) => setSizeSqm(Number(e.target.value))}
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
                    Security Deposit (SZL)
                  </label>
                  <input
                    type="number"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Occupancy Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UnitStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unit Description & Amenities
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details on power, water points, entrance location..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="add-public-listing"
                  checked={publicListing}
                  onChange={(e) => setPublicListing(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="add-public-listing" className="text-slate-700 dark:text-slate-300 font-medium">
                  List this unit on public leasing marketplace
                </label>
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
                  Create Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT UNIT MODAL */}
      {editingShop && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Edit Unit {editingShop.shop_number}
                </h3>
              </div>
              <button
                onClick={() => setEditingShop(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit / Shop Number
                  </label>
                  <input
                    type="text"
                    required
                    value={shopNumber}
                    onChange={(e) => setShopNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shopping Center
                  </label>
                  <select
                    value={centerId}
                    onChange={(e) => setCenterId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {db.shoppingCenters.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Space Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as Property['type'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Retail shop">Retail Shop</option>
                    <option value="Office">Commercial Office</option>
                    <option value="Restaurant">Restaurant / Food Court</option>
                    <option value="Kiosk">Concourse Kiosk</option>
                    <option value="Commercial unit">Commercial Unit</option>
                    <option value="Warehouse">Warehouse / Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floor Level
                  </label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Size (sqm)
                  </label>
                  <input
                    type="number"
                    required
                    value={sizeSqm}
                    onChange={(e) => setSizeSqm(Number(e.target.value))}
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
                    Security Deposit (SZL)
                  </label>
                  <input
                    type="number"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UnitStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-public-listing"
                  checked={publicListing}
                  onChange={(e) => setPublicListing(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="edit-public-listing" className="text-slate-700 dark:text-slate-300 font-medium">
                  List this unit on public leasing marketplace
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingShop(null)}
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

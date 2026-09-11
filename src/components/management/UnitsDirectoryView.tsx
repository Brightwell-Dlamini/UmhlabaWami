import React, { useState, useEffect } from 'react';
import {
  Building2,
  Store,
  MapPin,
  PlusCircle,
  Search,
  X,
  Layers,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { createCentre, createProperty, createUnit } from '../../services/portfolioService';
import type { Shop, UnitStatus, Property, ShoppingCenter } from '../../types';

interface UnitsDirectoryViewProps {
  onSelectShop?: (shop: Shop) => void;
}

type WorkbenchTab = 'centres' | 'properties' | 'units';

const PROPERTY_TYPES: Property['type'][] = [
  'Retail shop',
  'Office',
  'Warehouse',
  'Restaurant',
  'Kiosk',
  'Commercial unit',
  'Mixed-use property',
];

export const UnitsDirectoryView: React.FC<UnitsDirectoryViewProps> = ({ onSelectShop }) => {
  const user = auth.getCurrentUser();
  const orgId = user?.organization_id || '';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const canBuildPortfolio = isAdmin;

  const [tab, setTab] = useState<WorkbenchTab>(canBuildPortfolio ? 'centres' : 'units');
  const [shops, setShops] = useState<Shop[]>([...db.shops]);
  const [centres, setCentres] = useState<ShoppingCenter[]>([...db.shoppingCenters]);
  const [properties, setProperties] = useState<Property[]>([...db.properties]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  // Unit form
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [shopNumber, setShopNumber] = useState('');
  const [centerId, setCenterId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [propertyType, setPropertyType] = useState<Property['type']>('Retail shop');
  const [floor, setFloor] = useState('Ground Floor');
  const [sizeSqm, setSizeSqm] = useState(65);
  const [rentalAmount, setRentalAmount] = useState(14000);
  const [depositAmount, setDepositAmount] = useState(28000);
  const [status, setStatus] = useState<UnitStatus>('Available');
  const [publicListing, setPublicListing] = useState(true);
  const [description, setDescription] = useState('');

  // Centre form
  const [showCentreModal, setShowCentreModal] = useState(false);
  const [centreName, setCentreName] = useState('');
  const [centreAddress, setCentreAddress] = useState('');
  const [centreLocation, setCentreLocation] = useState('Mbabane Central');
  const [centreHours, setCentreHours] = useState('08:00 – 18:00');
  const [centreParking, setCentreParking] = useState(50);

  // Property form
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [propName, setPropName] = useState('');
  const [propCentreId, setPropCentreId] = useState('');
  const [propType, setPropType] = useState<Property['type']>('Retail shop');
  const [propDesc, setPropDesc] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setShops([...db.shops]);
      setCentres([...db.shoppingCenters]);
      setProperties([...db.properties]);
    });
    return () => unsub();
  }, []);

  const orgCentres = centres.filter((c) => !orgId || c.organization_id === orgId);
  const orgProperties = properties.filter((p) => !orgId || p.organization_id === orgId);
  const orgShops = shops.filter((s) => !orgId || s.organization_id === orgId);

  const propertiesForCentre = (cid: string) =>
    orgProperties.filter((p) => p.shopping_center_id === cid);

  const openUnitModal = () => {
    const first = orgCentres[0]?.id || '';
    setCenterId(first);
    const props = propertiesForCentre(first);
    setPropertyId(props[0]?.id || '');
    setShopNumber('');
    setPropertyType('Retail shop');
    setFloor('Ground Floor');
    setSizeSqm(75);
    setRentalAmount(16500);
    setDepositAmount(33000);
    setStatus('Available');
    setPublicListing(true);
    setDescription('');
    setShowUnitModal(true);
  };

  const handleSaveCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !centreName.trim()) return;
    setSaving(true);
    const result = await createCentre({
      organization_id: orgId,
      name: centreName,
      address: centreAddress || centreName,
      location: centreLocation,
      operating_hours: centreHours,
      parking_bays: centreParking,
    });
    setSaving(false);
    if (!result.success) {
      setFeedback(result.error || 'Could not create centre');
      return;
    }
    setShowCentreModal(false);
    setCentreName('');
    setFeedback(`Centre “${result.centre?.name}” created. Next: add a property (building/block), then units.`);
    setTab('properties');
    setTimeout(() => setFeedback(''), 6000);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !propName.trim() || !propCentreId) return;
    setSaving(true);
    const result = await createProperty({
      organization_id: orgId,
      shopping_center_id: propCentreId,
      name: propName,
      type: propType,
      description: propDesc,
    });
    setSaving(false);
    if (!result.success) {
      setFeedback(result.error || 'Could not create property');
      return;
    }
    setShowPropertyModal(false);
    setPropName('');
    setFeedback(`Property “${result.property?.name}” created. Next: add units under it.`);
    setTab('units');
    setTimeout(() => setFeedback(''), 6000);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !shopNumber.trim() || !centerId) return;
    let pid = propertyId;
    if (!pid) {
      // Auto-create a default property block if none
      const centre = orgCentres.find((c) => c.id === centerId);
      const created = await createProperty({
        organization_id: orgId,
        shopping_center_id: centerId,
        name: `${centre?.name || 'Centre'} — Main block`,
        type: propertyType,
      });
      if (!created.success || !created.property) {
        setFeedback(created.error || 'Create a property first');
        return;
      }
      pid = created.property.id;
    }
    setSaving(true);
    const result = await createUnit({
      organization_id: orgId,
      shopping_center_id: centerId,
      property_id: pid,
      shop_number: shopNumber,
      floor,
      size_sqm: sizeSqm,
      rental_amount: rentalAmount,
      deposit_amount: depositAmount,
      status,
      public_listing: publicListing,
      property_type: propertyType,
      description,
    });
    setSaving(false);
    if (!result.success) {
      setFeedback(result.error || 'Could not create unit');
      return;
    }
    setShowUnitModal(false);
    setFeedback(`Unit ${shopNumber} added${result.error ? ` (${result.error})` : ''}.`);
    setTimeout(() => setFeedback(''), 5000);
  };

  const filteredShops = orgShops.filter((shop) => {
    if (selectedCenterId !== 'all' && shop.shopping_center_id !== selectedCenterId) return false;
    if (statusFilter !== 'all' && shop.status !== statusFilter) return false;
    if (search && !shop.shop_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            {canBuildPortfolio ? 'Centres, Properties & Units' : 'Units on site'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {canBuildPortfolio
              ? 'Build your portfolio: Centre → Property (building) → Unit (leasable space).'
              : 'View and manage units at your centres. Portfolio structure is set by Organisation Admin.'}
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs">
          {feedback}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(
          [
            canBuildPortfolio ? (['centres', 'Centres'] as const) : null,
            canBuildPortfolio ? (['properties', 'Properties'] as const) : null,
            ['units', 'Units'] as const,
          ].filter(Boolean) as [WorkbenchTab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${
              tab === id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* CENTRES */}
      {tab === 'centres' && canBuildPortfolio && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">{orgCentres.length} centre(s)</p>
            <button
              type="button"
              onClick={() => setShowCentreModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add Centre
            </button>
          </div>
          {orgCentres.length === 0 && (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-500">
              No centres yet. Add your first shopping centre / site to start the portfolio.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {orgCentres.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {c.location}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{c.address}</div>
                <div className="mt-2 text-[10px] text-slate-500">
                  {propertiesForCentre(c.id).length} properties ·{' '}
                  {orgShops.filter((s) => s.shopping_center_id === c.id).length} units
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROPERTIES */}
      {tab === 'properties' && canBuildPortfolio && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">{orgProperties.length} property block(s)</p>
            <button
              type="button"
              disabled={orgCentres.length === 0}
              onClick={() => {
                setPropCentreId(orgCentres[0]?.id || '');
                setShowPropertyModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white disabled:opacity-40"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add Property
            </button>
          </div>
          {orgCentres.length === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl">Create a Centre first.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {orgProperties.map((p) => {
              const c = orgCentres.find((x) => x.id === p.shopping_center_id);
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <div className="font-bold text-sm">{p.name}</div>
                  <div className="text-[11px] text-slate-500">{p.type}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Centre: {c?.name || '—'}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* UNITS */}
      {tab === 'units' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search unit #"
                  className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="all">All centres</option>
                {orgCentres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="all">All statuses</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
            {(canBuildPortfolio || user?.role === 'property_manager') && (
              <button
                type="button"
                onClick={openUnitModal}
                disabled={orgCentres.length === 0 && canBuildPortfolio}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white disabled:opacity-40"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Unit
              </button>
            )}
          </div>

          {canBuildPortfolio && orgCentres.length === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl">
              Add a Centre (and ideally a Property) before adding units.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredShops.map((shop) => {
              const centre = orgCentres.find((c) => c.id === shop.shopping_center_id);
              return (
                <div
                  key={shop.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm">Unit {shop.shop_number}</div>
                      <div className="text-[11px] text-slate-500">{centre?.name || '—'}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900">
                      {shop.status}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                    <div>
                      {shop.floor} · {shop.size_sqm} m² · {shop.property_type}
                    </div>
                    <div className="font-semibold text-blue-600">
                      E{Number(shop.rental_amount || 0).toLocaleString()}/mo
                    </div>
                  </div>
                  {onSelectShop && (
                    <button
                      type="button"
                      onClick={() => onSelectShop(shop)}
                      className="mt-3 text-[11px] font-semibold text-blue-600"
                    >
                      View details
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {filteredShops.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500 rounded-2xl border border-dashed border-slate-200">
              No units match your filters.
            </div>
          )}
        </div>
      )}

      {/* Centre modal */}
      {showCentreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70">
          <form
            onSubmit={(e) => void handleSaveCentre(e)}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-3 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> New Centre
              </h3>
              <button type="button" onClick={() => setShowCentreModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              required
              value={centreName}
              onChange={(e) => setCentreName(e.target.value)}
              placeholder="Centre name e.g. The Gables"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            />
            <input
              value={centreAddress}
              onChange={(e) => setCentreAddress(e.target.value)}
              placeholder="Street address"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            />
            <select
              value={centreLocation}
              onChange={(e) => setCentreLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            >
              <option>Mbabane Central</option>
              <option>Ezulwini Valley</option>
              <option>Manzini City</option>
              <option>Matsapha Industrial</option>
              <option>Nhlangano</option>
              <option>Piggs Peak</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={centreHours}
                onChange={(e) => setCentreHours(e.target.value)}
                placeholder="Hours"
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
              <input
                type="number"
                value={centreParking}
                onChange={(e) => setCentreParking(Number(e.target.value))}
                placeholder="Parking bays"
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-blue-600 text-white"
            >
              {saving ? 'Saving…' : 'Create Centre'}
            </button>
          </form>
        </div>
      )}

      {/* Property modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70">
          <form
            onSubmit={(e) => void handleSaveProperty(e)}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-3 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">New Property (building / block)</h3>
              <button type="button" onClick={() => setShowPropertyModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <select
              required
              value={propCentreId}
              onChange={(e) => setPropCentreId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            >
              {orgCentres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              required
              value={propName}
              onChange={(e) => setPropName(e.target.value)}
              placeholder="e.g. Block A / North Wing"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            />
            <select
              value={propType}
              onChange={(e) => setPropType(e.target.value as Property['type'])}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <textarea
              value={propDesc}
              onChange={(e) => setPropDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-blue-600 text-white"
            >
              {saving ? 'Saving…' : 'Create Property'}
            </button>
          </form>
        </div>
      )}

      {/* Unit modal */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70">
          <form
            onSubmit={(e) => void handleSaveUnit(e)}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-3 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" /> New Unit
              </h3>
              <button type="button" onClick={() => setShowUnitModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <select
              required
              value={centerId}
              onChange={(e) => {
                setCenterId(e.target.value);
                const props = propertiesForCentre(e.target.value);
                setPropertyId(props[0]?.id || '');
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            >
              {orgCentres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            >
              <option value="">Auto-create main block if empty</option>
              {propertiesForCentre(centerId).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              required
              value={shopNumber}
              onChange={(e) => setShopNumber(e.target.value)}
              placeholder="Unit number e.g. G-14"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as Property['type'])}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="Floor"
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={sizeSqm}
                onChange={(e) => setSizeSqm(Number(e.target.value))}
                placeholder="m²"
                className="px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
              <input
                type="number"
                value={rentalAmount}
                onChange={(e) => setRentalAmount(Number(e.target.value))}
                placeholder="Rent E"
                className="px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                placeholder="Deposit E"
                className="px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UnitStatus)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
              <label className="flex items-center gap-2 text-xs px-2">
                <input
                  type="checkbox"
                  checked={publicListing}
                  onChange={(e) => setPublicListing(e.target.checked)}
                />
                List on marketplace
              </label>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Description"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-blue-600 text-white"
            >
              {saving ? 'Saving…' : 'Create Unit'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

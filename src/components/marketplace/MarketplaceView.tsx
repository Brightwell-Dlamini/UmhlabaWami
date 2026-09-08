import React, { useState } from 'react';
import {
  Search,
  Filter,
  Building,
  Store,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Clock,
  FileText,
  DollarSign,
  Users,
  CheckCircle2,
  Wrench,
  BellRing,
  ArrowRight,
  Star,
  Layers,
  Building2,
} from 'lucide-react';
import { HeroSection } from './HeroSection';
import { PropertyCard } from './PropertyCard';
import { Property, Shop } from '../../types';
import { db } from '../../services/db';

interface MarketplaceViewProps {
  onSelectProperty?: (property: Property, shop?: Shop) => void;
  onEnquire?: (property: Property, shop?: Shop) => void;
  onOpenListLead?: () => void;
  onManageClick?: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onSelectProperty,
  onEnquire,
  onOpenListLead,
  onManageClick,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMax, setPriceMax] = useState<number>(100000);

  // Available shops listed publicly
  const publicShops = db.shops.filter((s) => s.public_listing);

  // Filter logic
  const filteredShops = publicShops.filter((shop) => {
    const prop = db.properties.find((p) => p.id === shop.property_id);
    const center = db.shoppingCenters.find((sc) => sc.id === shop.shopping_center_id);
    if (!prop) return false;

    if (selectedType !== 'all' && selectedType !== 'All') {
      const typeLower = selectedType.toLowerCase();
      const shopTypeLower = (shop.property_type || '').toLowerCase();
      if (!shopTypeLower.includes(typeLower) && !typeLower.includes(shopTypeLower)) {
        return false;
      }
    }

    if (selectedLocation !== 'all' && selectedLocation !== 'All') {
      const locQuery = selectedLocation.toLowerCase();
      const locationText = `${center?.location || ''} ${prop.address} ${center?.name || ''}`.toLowerCase();
      if (!locationText.includes(locQuery)) return false;
    }

    if (selectedSize !== 'all' && selectedSize !== 'All') {
      if (selectedSize === 'small' && shop.size_sqm >= 50) return false;
      if (selectedSize === 'medium' && (shop.size_sqm < 50 || shop.size_sqm > 120)) return false;
      if (selectedSize === 'large' && (shop.size_sqm < 120 || shop.size_sqm > 250)) return false;
      if (selectedSize === 'industrial' && shop.size_sqm < 250) return false;
    }

    if (shop.rental_amount > priceMax) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = shop.shop_number.toLowerCase().includes(q);
      const matchProp = prop.name.toLowerCase().includes(q);
      const matchLocation = (center?.location || prop.address).toLowerCase().includes(q);
      const matchType = (shop.property_type || '').toLowerCase().includes(q);
      if (!matchNumber && !matchProp && !matchLocation && !matchType) return false;
    }

    return true;
  });

  const categories = [
    { id: 'all', label: 'All Spaces' },
    { id: 'Retail', label: 'Retail & Shops' },
    { id: 'Restaurant', label: 'Food & Beverage' },
    { id: 'Office', label: 'Commercial Offices' },
    { id: 'Warehouse', label: 'Warehouse & Logistics' },
    { id: 'Medical', label: 'Medical Suites' },
    { id: 'Kiosk', label: 'Kiosks & Pop-ups' },
  ];

  const handleExploreScroll = () => {
    const el = document.getElementById('explore-spaces');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-14 pb-20">
      {/* Search Hero */}
      <HeroSection
        onSearch={(filters) => {
          setSelectedLocation(filters.location);
          if (filters.propertyType !== 'all') setSelectedType(filters.propertyType);
          if (filters.sizeCategory !== 'all') setSelectedSize(filters.sizeCategory);
        }}
        onExploreClick={handleExploreScroll}
        onManageClick={onManageClick}
        onListLead={onOpenListLead}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
      />

      {/* Real Estate & Trust Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">100% Verified</div>
              <div className="text-[11px] text-slate-500">Commercial retail hubs</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">&lt; 2hr SLA</div>
              <div className="text-[11px] text-slate-500">Fast facilities response</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Real-Time Sync</div>
              <div className="text-[11px] text-slate-500">Live vacancy updates</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">SZL Emalangeni</div>
              <div className="text-[11px] text-slate-500">Sage & local billing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Listing Section: Available Spaces */}
      <section id="explore-spaces" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 scroll-mt-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2 border border-blue-200/60 dark:border-blue-800/40">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Commercial Vacancy Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
              Available Retail & Commercial Spaces
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Showing <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredShops.length}</span> verified spaces across Eswatini
            </p>
          </div>

          {/* Quick Search & City Select */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unit, center or brand..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Cities in Eswatini</option>
              <option value="Ezulwini">Ezulwini Valley</option>
              <option value="Mbabane">Mbabane Central</option>
              <option value="Matsapha">Matsapha Industrial</option>
              <option value="Manzini">Manzini Commercial</option>
              <option value="Nhlangano">Nhlangano</option>
              <option value="Piggs Peak">Piggs Peak</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedType === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {filteredShops.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <Store className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              No matching spaces found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try resetting your category or location filters, or submit a landlord request to register a new commercial center.
            </p>
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedLocation('all');
                setSelectedSize('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => {
              const prop = db.properties.find((p) => p.id === shop.property_id);
              if (!prop) return null;

              return (
                <PropertyCard
                  key={shop.id}
                  property={prop}
                  shop={shop}
                  onViewDetails={() => {
                    if (typeof onSelectProperty === 'function') {
                      onSelectProperty(prop, shop);
                    }
                  }}
                  onClick={() => {
                    if (typeof onSelectProperty === 'function') {
                      onSelectProperty(prop, shop);
                    }
                  }}
                  onEnquire={() => {
                    if (typeof onEnquire === 'function') {
                      onEnquire(prop, shop);
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Shopping Centers Showcase */}
      <section id="featured-centers" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5 pt-4 scroll-mt-24">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2 border border-indigo-200/60 dark:border-indigo-800/40">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Prime Shopping Destinations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Featured Eswatini Commercial Hubs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Top retail centers with guaranteed foot-traffic, high security, and premier facilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {db.shoppingCenters.map((center) => (
            <div
              key={center.id}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src={center.image}
                  alt={center.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/90 px-2 py-0.5 rounded backdrop-blur-sm">
                    {center.status === 'Active' ? 'Commercial Hub' : center.status}
                  </span>
                  <h3 className="font-bold text-base mt-1">{center.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-200 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{center.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {center.description}
                </p>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {center.amenities?.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 rounded-md font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Units</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {db.shops.filter((s) => s.shopping_center_id === center.id).length || 24} Units
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Vacancies</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {db.shops.filter((s) => s.shopping_center_id === center.id && s.status === 'Available').length} Available
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 scroll-mt-24">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/40 px-3 py-1 rounded-full">
              Streamlined Commercial Real Estate
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
              How Umhlaba Wami Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              A transparent, end-to-end ecosystem connecting commercial landlords, retail tenants, and maintenance crews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                Discover Verified Vacancies
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Filter retail shops, commercial offices, and industrial spaces across Ezulwini, Mbabane, and Manzini with transparent rental rates, square meters, and center amenities.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/20">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                Digital Leases & Onboarding
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Submit digital enquiries, complete company KYC, sign standard commercial leases with escalation clauses, and track security deposits securely.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/20">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                Unified Operations & SLAs
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Raise maintenance tickets with photo attachments, track SLA resolution countdowns, record Emalangeni rent roll invoices, and receive emergency facility alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Capabilities Section */}
      <section id="enterprise-features" className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 scroll-mt-24">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-900/40 px-3 py-1 rounded-full">
              Commercial Facilities Engine
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
              Enterprise Features Built for Eswatini
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Purpose-built tools for shopping centers, commercial portfolios, and property management firms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                4-Tier SLA Countdown Engine
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Guaranteed response times: 15-minute emergency dispatch, 1-hour urgent, and 4-hour routine SLAs with real-time breach alerts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Rent Roll & Sage Export
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Automated monthly billing in Emalangeni (SZL), tenant arrears tracking, digital receipts, and one-click Sage Pastel/QuickBooks CSV export.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Mobile Field Technician App
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                On-the-go job queue for technicians to claim tickets, log material costs and hours, and capture before/after photo verification.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Emergency Utility Broadcasts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Instant WhatsApp, SMS and In-App alert broadcasts during Eswatini Electricity Company (EEC) cuts or EWSC water supply disruptions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Digital Leases & KYC Directory
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Centralized tenant lease archives, annual escalation tracking, and direct tenant portal access for billing and ticket status.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Contractor & Vendor Directory
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Approved supplier records for HVAC, electrical, plumbing, generator servicing, elevator maintenance, and fire safety systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="border-t border-slate-200 dark:border-slate-800 pt-10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Trusted Across Eswatini Commercial Centers
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Feedback from property managers and commercial tenants in the Kingdom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                "Our maintenance ticket turnaround dropped from 48 hours to under 2 hours. Tenants at The Gables are noticeably happier and rent collection is seamless."
              </p>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                — Lindiwe Dlamini, Portfolio Director, Ezulwini
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                "As a commercial retail tenant, being able to report a roof leak with a photo and watch the technician arrive with live SLA countdown gave us peace of mind."
              </p>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                — Sipho Nkambule, Pick n Pay Express Manager
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                "The Sage Pastel CSV export cuts our month-end reconciliation down to 15 minutes. Best commercial property management platform in Eswatini."
              </p>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                — Thandeka Nxumalo, Financial Controller
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Landlord CTA Banner */}
      <section id="list-property-banner" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3 relative z-10 max-w-xl">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              For Commercial Property Owners & Shopping Center Landlords
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
              Have Vacant Commercial Space or Retail Units in Eswatini?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              List your retail units, office suites or industrial warehouses directly on Umhlaba Wami. Attract verified corporate tenants, digitize leases and streamline tenant facilities operations.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              id="landing-list-lead-cta"
              onClick={onOpenListLead}
              className="px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>List Your Property Free</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            {onManageClick && (
              <button
                id="landing-demo-cta"
                onClick={onManageClick}
                className="px-6 py-3.5 bg-blue-800/80 hover:bg-blue-700/80 text-white font-bold text-xs sm:text-sm rounded-xl border border-blue-600/40 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Live Operations Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};


import React from 'react';
import { Search, MapPin, Building, Maximize2, ArrowRight, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { Property } from '../../types';

interface HeroSectionProps {
  onSearch: (filters: { location: string; propertyType: string; sizeCategory: string }) => void;
  onExploreClick: () => void;
  onManageClick?: () => void;
  onListLead?: () => void;
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  selectedSize: string;
  setSelectedSize: (val: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onExploreClick,
  onManageClick,
  onListLead,
  selectedLocation,
  setSelectedLocation,
  selectedType,
  setSelectedType,
  selectedSize,
  setSelectedSize,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location: selectedLocation,
      propertyType: selectedType,
      sizeCategory: selectedSize,
    });
    onExploreClick();
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
      {/* Decorative background blurs */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-10 w-72 h-72 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-6 border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Kingdom of Eswatini Commercial Property & Facilities Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] font-display mb-5">
            Find the right space.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
              Manage it better.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            Discover available retail, commercial and rental spaces across Eswatini while managing your properties, tenants, SLAs and operations from one unified platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="hero-explore-btn"
              onClick={onExploreClick}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Explore Available Spaces</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            {onManageClick && (
              <button
                id="hero-manage-btn"
                onClick={onManageClick}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl shadow-sm transition cursor-pointer"
              >
                Launch Operations Dashboard
              </button>
            )}
            {onListLead && (
              <button
                id="hero-list-lead-btn"
                onClick={onListLead}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition cursor-pointer"
              >
                List Your Property
              </button>
            )}
          </div>
        </div>

        {/* Prominent Property Search Component */}
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800/95 rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/80 dark:border-slate-700/80 p-3 sm:p-4 backdrop-blur-sm"
          >
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Where do you want to operate?</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {/* Location */}
              <div className="relative">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 px-1">
                  Location
                </label>
                <div className="flex items-center px-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mr-2" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Locations in Eswatini</option>
                    <option value="Ezulwini Valley">Ezulwini Valley</option>
                    <option value="Mbabane Central">Mbabane Central (Capital)</option>
                    <option value="Manzini City">Manzini City (Commercial Hub)</option>
                    <option value="Matsapha Industrial">Matsapha Industrial Estate</option>
                    <option value="Nhlangano">Nhlangano</option>
                    <option value="Piggs Peak">Piggs Peak</option>
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div className="relative">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 px-1">
                  Space Type
                </label>
                <div className="flex items-center px-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600">
                  <Building className="w-4 h-4 text-blue-600 shrink-0 mr-2" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Property Types</option>
                    <option value="Retail shop">Retail Shop</option>
                    <option value="Office">Executive Office</option>
                    <option value="Restaurant">Restaurant & Cafe</option>
                    <option value="Kiosk">Concourse Kiosk</option>
                    <option value="Warehouse">Warehouse & Logistics</option>
                    <option value="Commercial unit">Commercial Unit</option>
                  </select>
                </div>
              </div>

              {/* Space Size */}
              <div className="relative">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 px-1">
                  Space Size
                </label>
                <div className="flex items-center px-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600">
                  <Maximize2 className="w-4 h-4 text-blue-600 shrink-0 mr-2" />
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="All">Any Size (sqm)</option>
                    <option value="small">Compact Kiosk & Office (&lt; 50 sqm)</option>
                    <option value="medium">Standard Retail (50 - 120 sqm)</option>
                    <option value="large">Spacious Store / Restaurant (120 - 250 sqm)</option>
                    <option value="industrial">High Cube Warehouse (250+ sqm)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Real-time vacancy: listings automatically update as units are leased</span>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Available Spaces</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

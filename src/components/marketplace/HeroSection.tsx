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
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-10 w-72 h-72 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] font-display mb-5">
            Find the right space.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
              Manage it better.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            Discover available retail, commercial and rental spaces across Eswatini while managing your properties,
            tenants, SLAs and operations from one unified platform.
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
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 md:p-5 grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">All locations</option>
              <option value="Mbabane">Mbabane</option>
              <option value="Manzini">Manzini</option>
              <option value="Ezulwini">Ezulwini</option>
              <option value="Matsapha">Matsapha</option>
            </select>
          </div>
          <div className="relative">
            <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">All types</option>
              <option value="Retail">Retail</option>
              <option value="Office">Office</option>
              <option value="Warehouse">Warehouse</option>
            </select>
          </div>
          <div className="relative">
            <Maximize2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Any size</option>
              <option value="small">Under 50 m²</option>
              <option value="medium">50–150 m²</option>
              <option value="large">150 m²+</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified centres</span>
          <span className="inline-flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-blue-500" /> SLA-backed ops</span>
          <span className="inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Built for Eswatini</span>
        </div>
      </div>
    </section>
  );
};

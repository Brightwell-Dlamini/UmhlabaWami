import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Clock,
  TrendingUp,
  DollarSign,
  Search,
  MapPin,
  Building2,
} from 'lucide-react';
import { db } from '../../services/db';
import type { Property, Shop } from '../../types';
import { PropertyCard } from './PropertyCard';

interface MarketplaceViewProps {
  onSelectProperty?: (property: Property, shop?: Shop) => void;
  onEnquire?: (property: Property, shop?: Shop) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onSelectProperty,
  onEnquire,
}) => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('all');

  const shops = useMemo(() => {
    return db.shops.filter((s) => s.public_listing !== false);
  }, [db.shops]);

  const centres = db.shoppingCenters;

  const filtered = shops.filter((s) => {
    const centre = centres.find((c) => c.id === s.shopping_center_id);
    if (location !== 'all' && centre?.location !== location) return false;
    if (search && !`${s.shop_number} ${s.description} ${centre?.name || ''}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const locations = Array.from(new Set(centres.map((c) => c.location).filter(Boolean)));

  return (
    <div className="space-y-10 pb-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
            Kingdom of Eswatini
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
            Commercial space & facilities, managed properly.
          </h1>
          <p className="mt-4 text-slate-300 max-w-xl text-sm sm:text-base">
            Find verified vacancies, run maintenance SLAs, and operate your portfolio on one platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#explore-spaces"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold"
            >
              Explore spaces
            </a>
          </div>
        </div>
      </section>

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
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">On-time leasing</div>
              <div className="text-[11px] text-slate-500">Vacancy-to-lease discipline</div>
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
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Integrated Billing</div>
              <div className="text-[11px] text-slate-500">External software supported</div>
            </div>
          </div>
        </div>
      </section>

      <section id="explore-spaces" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Available spaces
            </h2>
            <p className="text-xs text-slate-500 mt-1">Public listings from verified organisations.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search units"
                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="all">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((shop) => {
            const property =
              db.properties.find((p) => p.id === shop.property_id) ||
              ({
                id: shop.property_id,
                organization_id: shop.organization_id,
                shopping_center_id: shop.shopping_center_id,
                name: `Unit ${shop.shop_number}`,
                type: shop.property_type || 'Commercial unit',
                address: '',
                description: shop.description,
                status: 'Active',
              } as Property);
            return (
              <PropertyCard
                key={shop.id}
                property={property}
                shop={shop}
                onSelect={() => onSelectProperty?.(property, shop)}
                onEnquire={() => onEnquire?.(property, shop)}
              />
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-slate-500 border border-dashed rounded-2xl">
            No public vacancies yet. Organisations can list units from their portfolio.
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 grid md:grid-cols-3 gap-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">On-time leasing</h3>
            <p className="text-slate-500">Track vacancy-to-lease discipline across your centres.</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Integrated billing</h3>
            <p className="text-slate-500">Rent rolls, deposits, and exports for external software.</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Facilities ops</h3>
            <p className="text-slate-500">Tickets, SLAs, and technician workflows in one place.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

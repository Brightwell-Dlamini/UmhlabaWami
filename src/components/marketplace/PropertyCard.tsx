import React, { useState } from 'react';
import {
  MapPin,
  Building,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Car,
  ArrowUpRight,
  PhoneCall,
} from 'lucide-react';
import { Shop, ShoppingCenter, Property } from '../../types';
import { db } from '../../services/db';

interface PropertyCardProps {
  shop: Shop;
  shoppingCenter?: ShoppingCenter;
  property?: Property;
  onViewDetails?: (shop: Shop) => void;
  onClick?: (shop: Shop) => void;
  onSelectProperty?: (property?: Property, shop?: Shop) => void;
  onEnquire?: (shop: Shop) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  shop,
  shoppingCenter,
  property,
  onViewDetails,
  onClick,
  onSelectProperty,
  onEnquire,
}) => {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const center =
    shoppingCenter ||
    (shop.shopping_center_id ? db.shoppingCenters.find((sc) => sc.id === shop.shopping_center_id) : undefined) ||
    (property?.shopping_center_id ? db.shoppingCenters.find((sc) => sc.id === property.shopping_center_id) : undefined);

  const images = shop.images.length > 0 ? shop.images : ['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80'];

  const handleViewDetails = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof onViewDetails === 'function') {
      onViewDetails(shop);
    } else if (typeof onClick === 'function') {
      onClick(shop);
    } else if (typeof onSelectProperty === 'function') {
      onSelectProperty(property, shop);
    }
  };

  const handleEnquire = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof onEnquire === 'function') {
      onEnquire(shop);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const isAvailable = shop.status === 'Available';

  return (
    <div
      onClick={handleViewDetails}
      className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Large Image Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img
          src={images[currentImgIdx]}
          alt={`${shop.shop_number} in ${center?.name || 'Commercial Center'}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Carousel arrows if multi-image */}
        {images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="p-1 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="p-1 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider backdrop-blur-md shadow-sm ${
              isAvailable
                ? 'bg-emerald-500/90 text-white'
                : shop.status === 'Reserved'
                ? 'bg-amber-500/90 text-white'
                : 'bg-slate-700/90 text-slate-200'
            }`}
          >
            {shop.status}
          </span>
          {shop.public_featured && (
            <span className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-blue-600/90 text-white backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Featured
            </span>
          )}
        </div>

        {/* Floor and Unit Badge on Image */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-black/60 text-white backdrop-blur-md">
            Unit {shop.shop_number} • {shop.floor}
          </span>
        </div>

        {/* Image index indicator dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentImgIdx ? 'bg-white w-3' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Price display overlay at bottom */}
        <div className="absolute bottom-2.5 left-3 text-white">
          <div className="text-lg font-bold font-display tracking-tight drop-shadow-md">
            E{shop.rental_amount.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-200">/ month</span>
          </div>
          <div className="text-[11px] text-slate-200/90 drop-shadow">
            Deposit: E{shop.deposit_amount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Shopping Center & Location */}
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
            <Building className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{shoppingCenter?.name || 'Commercial Center'}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{shoppingCenter?.location || 'Eswatini'}</span>
          </div>

          {/* Title & Type */}
          <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-1 mb-1.5 group-hover:text-blue-600 transition-colors">
            {shop.property_type} — Unit {shop.shop_number}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
            {shop.description}
          </p>

          {/* Specs bar (Size, power, parking) */}
          <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 dark:border-slate-700/60 mb-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-medium">{shop.size_sqm} sqm usable</span>
            </div>
            {shop.parking_allocated && shop.parking_allocated > 0 && (
              <div className="flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{shop.parking_allocated} Parking Bays</span>
              </div>
            )}
          </div>

          {/* Key Features Chips */}
          {shop.features && shop.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {shop.features.slice(0, 3).map((feat, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                >
                  {feat}
                </span>
              ))}
              {shop.features.length > 3 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-500">
                  +{shop.features.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card CTA Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-1"
          >
            <span>View Property</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleEnquire}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition flex items-center justify-center gap-1"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Enquire Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

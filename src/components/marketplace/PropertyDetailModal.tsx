import React, { useState } from 'react';
import {
  X,
  MapPin,
  Building,
  Maximize2,
  Calendar,
  CheckCircle2,
  Clock,
  Car,
  Zap,
  Shield,
  Share2,
  Heart,
  PhoneCall,
  Send,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Shop, ShoppingCenter, Property } from '../../types';
import { db } from '../../services/db';

interface PropertyDetailModalProps {
  shop: Shop | null;
  shoppingCenter?: ShoppingCenter;
  property?: Property | null;
  allShops?: Shop[];
  onClose: () => void;
  onEnquire?: (propertyOrShop: any, shop?: Shop | null) => void;
  onSelectAnotherShop?: (shop: Shop) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  shop,
  shoppingCenter,
  property,
  allShops,
  onClose,
  onEnquire,
  onSelectAnotherShop,
}) => {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!shop) return null;

  const images = (shop.images && shop.images.length > 0)
    ? shop.images
    : ['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80'];

  const currentCenter =
    shoppingCenter ||
    (shop.shopping_center_id ? db.shoppingCenters.find((sc) => sc.id === shop.shopping_center_id) : undefined) ||
    (property?.shopping_center_id ? db.shoppingCenters.find((sc) => sc.id === property.shopping_center_id) : undefined);

  const currentProperty =
    property ||
    (shop.property_id ? db.properties.find((p) => p.id === shop.property_id) : null);

  const availableList = allShops || db.shops;
  const similarShops = (availableList || [])
    .filter((s) => s.id !== shop.id && s.status === 'Available')
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEnquire = () => {
    if (typeof onEnquire === 'function') {
      if (currentProperty) {
        onEnquire(currentProperty, shop);
      } else {
        onEnquire(shop);
      }
    }
  };

  const handleSelectAnotherShop = (s: Shop) => {
    if (typeof onSelectAnotherShop === 'function') {
      onSelectAnotherShop(s);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              {shop.property_type}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Unit {shop.shop_number} • {currentCenter?.name || 'Commercial Center'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copied && <span className="text-xs text-emerald-600 font-semibold">Link copied!</span>}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Gallery View */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
              <img
                src={images[selectedImgIdx]}
                alt={shop.shop_number}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider text-white shadow-md ${
                    shop.status === 'Available' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                >
                  {shop.status}
                </span>
                {shop.public_featured && (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Featured Space
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIdx(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                      selectedImgIdx === idx ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Core Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                  {shoppingCenter?.name}: Unit {shop.shop_number} ({shop.floor})
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{shoppingCenter?.address || 'Eswatini'} • {shoppingCenter?.location}</span>
                </div>
              </div>

              {/* Key Quick Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Usable Size</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{shop.size_sqm} sqm</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Floor Level</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {shop.floor}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Availability</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {shop.available_from || 'Immediate Move-in'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Power Specs</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{shop.power_specs || 'Single-phase meter'}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Allocated Parking</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    <span>{shop.parking_allocated || 0} dedicated bays</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Center Operating Hours</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{shoppingCenter?.operating_hours || '08:00 - 18:00'}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Space Description
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {shop.description}
                </p>
              </div>

              {/* Amenities & Specifications list */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Unit Features & Amenities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {shop.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                  {shoppingCenter?.amenities?.map((amenity, idx) => (
                    <div key={`sc-${idx}`} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Enquiry CTA Card */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800 dark:to-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Monthly Lease Rate</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                    E{shop.rental_amount.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500 ml-1">/ mo excl. VAT</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 pt-3">
                  <div className="flex justify-between">
                    <span>Security Deposit</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      E{shop.deposit_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate per sqm</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      E{(shop.rental_amount / shop.size_sqm).toFixed(1)} / sqm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lease Term</span>
                    <span className="font-semibold text-slate-900 dark:text-white">12 - 36 months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Water & Backup Power</span>
                    <span className="font-semibold text-emerald-600">Included in Levy</span>
                  </div>
                </div>

                <button
                  onClick={handleEnquire}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Book Viewing / Enquire</span>
                </button>

                <div className="text-[11px] text-slate-500 text-center">
                  Direct enquiry routed straight to the registered property management team.
                </div>
              </div>
            </div>
          </div>

          {/* Similar available spaces */}
          {similarShops.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Other Vacant Spaces in Eswatini
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {similarShops.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectAnotherShop(s)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 flex gap-3"
                  >
                    <img
                      src={s.images[0] || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=300&q=80'}
                      alt={s.shop_number}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Unit {s.shop_number} ({s.size_sqm} sqm)
                      </div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
                        E{s.rental_amount.toLocaleString()}/mo
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{s.property_type} • {s.floor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

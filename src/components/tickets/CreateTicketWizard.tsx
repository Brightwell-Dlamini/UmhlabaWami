import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileImage,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { TicketPriority, TicketCategory } from '../../types';

interface CreateTicketWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ticketNumber: string) => void;
  defaultPropertyId?: string;
  defaultShopId?: string;
}

export const CreateTicketWizard: React.FC<CreateTicketWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultPropertyId,
  defaultShopId,
}) => {
  const currentUser = auth.getCurrentUser();
  const [step, setStep] = useState(1);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Plumbing / Water');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [description, setDescription] = useState('');
  const [exactLocation, setExactLocation] = useState('');

  // Selected Unit & Property
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    currentUser?.property_id || defaultPropertyId || db.properties[0]?.id || ''
  );
  const [selectedShopId, setSelectedShopId] = useState(
    currentUser?.shop_id || defaultShopId || db.shops[0]?.id || ''
  );

  // Evidence files
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  ]);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // SLA Calculation Preview
  const getSlaHours = (p: TicketPriority) => {
    switch (p) {
      case 'Emergency':
        return { response: '15 Minutes', resolution: '2 Hours' };
      case 'High':
        return { response: '1 Hour', resolution: '6 Hours' };
      case 'Medium':
        return { response: '4 Hours', resolution: '24 Hours' };
      case 'Low':
        return { response: '24 Hours', resolution: '72 Hours' };
    }
  };

  const slaPreview = getSlaHours(priority);

  // Handle mock file upload with 2MB limit validation (Requirement #17)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setUploadError('File size exceeds 2MB limit. Please compress or select another photo.');
        return;
      }
      // Mock upload URL
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setUploadedImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!currentUser) return;
    setIsSubmitting(true);

    const prop = db.properties.find((p) => p.id === selectedPropertyId) || db.properties[0];
    const shop = db.shops.find((s) => s.id === selectedShopId) || db.shops[0];
    const tenant = db.tenants.find((t) => t.user_id === currentUser.id) || db.tenants[0];

    const ticket = db.createTicket({
      organization_id: prop.organization_id,
      property_id: prop.id,
      shopping_center_id: prop.shopping_center_id,
      shop_id: shop.id,
      tenant_id: tenant.id,
      title,
      description,
      exact_location_description: exactLocation,
      priority,
      category,
      created_by_user_id: currentUser.id,
      before_images: uploadedImages,
    });

    setIsSubmitting(false);
    onSuccess(ticket.ticket_number);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Log Maintenance Ticket or Issue
              </h3>
              <p className="text-[11px] text-slate-500">
                Step {step} of 4: {step === 1 ? 'Issue & Category' : step === 2 ? 'Priority & SLA' : step === 3 ? 'Location & Photos' : 'Review & Dispatch'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="bg-blue-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <form onSubmit={handleNext} className="p-6 space-y-4">
          {/* STEP 1: ISSUE & CATEGORY */}
          {step === 1 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Summary Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Water leak beneath restroom basin"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Plumbing / Water">Plumbing & Water Supply</option>
                  <option value="Electrical / Lighting">Electrical, Power & Lighting</option>
                  <option value="HVAC / Air Conditioning">HVAC & Air Conditioning</option>
                  <option value="Structural / Glass">Structural, Doors, Glass & Locks</option>
                  <option value="Security / Access">Security, CCTV & Access Control</option>
                  <option value="Pest Control">Pest Control & Fumigation</option>
                  <option value="Waste / Cleaning">Waste Management & Deep Cleaning</option>
                  <option value="General Maintenance">General Commercial Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description of Problem *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed symptoms: when it started, whether it affects customer traffic or stock..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: PRIORITY & SLA */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Severity & Response SLA Level *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Emergency */}
                <div
                  onClick={() => setPriority('Emergency')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    priority === 'Emergency'
                      ? 'border-red-600 bg-red-50/50 dark:bg-red-950/40 text-red-900 dark:text-red-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-600">🚨 EMERGENCY</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">15 min SLA</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Direct threat to life, massive flooding, fire hazard, or immediate store closure risk.
                  </p>
                </div>

                {/* High */}
                <div
                  onClick={() => setPriority('High')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    priority === 'High'
                      ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600">HIGH PRIORITY</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">1 hr SLA</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Major power fault, air conditioning breakdown during peak hours, retail display hazard.
                  </p>
                </div>

                {/* Medium */}
                <div
                  onClick={() => setPriority('Medium')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    priority === 'Medium'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">MEDIUM PRIORITY</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">4 hr SLA</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Standard maintenance: slow drainage, non-critical light bulb replacement, door handle fix.
                  </p>
                </div>

                {/* Low */}
                <div
                  onClick={() => setPriority('Low')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    priority === 'Low'
                      ? 'border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">LOW PRIORITY</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">24 hr SLA</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Minor aesthetic touch-up, painting request, planned non-urgent inspection.
                  </p>
                </div>
              </div>

              {/* SLA Target Banner */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Target First Response: </span>
                    <span className="font-bold text-blue-600">{slaPreview.response}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Target Resolution: </span>
                  <span className="font-bold text-slate-900 dark:text-white">{slaPreview.resolution}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION & PHOTOS */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shopping Center / Property
                  </label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    {db.properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit / Shop Number
                  </label>
                  <select
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    {db.shops.map((s) => (
                      <option key={s.id} value={s.id}>Unit {s.shop_number} ({s.floor})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Exact Location Within Unit
                </label>
                <input
                  type="text"
                  value={exactLocation}
                  onChange={(e) => setExactLocation(e.target.value)}
                  placeholder="e.g. Behind the back storeroom counter / under the sink"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Photo Evidence Upload with 2MB Limit */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Photo / Evidence (Max 2MB per file)
                  </label>
                  <span className="text-[10px] text-slate-400">JPG, PNG</span>
                </div>

                {uploadError && (
                  <div className="p-2 text-[11px] text-red-600 bg-red-50 rounded-lg mb-2">
                    {uploadError}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Attach Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <div className="flex gap-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300">
                        <img src={img} alt="evidence" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & DISPATCH */}
          {step === 4 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Auto-Generated Ticket Number
                  </span>
                  <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-300 text-blue-800 dark:text-blue-200">
                    GA-G14-{new Date().toISOString().slice(2, 10).replace(/-/g, '')}-0002
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">{description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500">Priority & SLA</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{priority} ({slaPreview.response})</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500">Category</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{category}</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Upon submitting, this ticket will be dispatched to the property management control tower and mobile technician roster with an active SLA timer.
              </p>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
              >
                <span>{step === 4 ? (isSubmitting ? 'Dispatching...' : 'Dispatch Ticket Now') : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

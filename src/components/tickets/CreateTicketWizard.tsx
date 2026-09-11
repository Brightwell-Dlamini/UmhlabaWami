import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Zap,
  Wrench,
  Droplets,
  Wind,
  Shield,
  ParkingCircle,
  Wifi,
  MoreHorizontal,
} from 'lucide-react';
import { db } from '../../services/db';
import { createTicketRemote } from '../../services/repository';
import { auth } from '../../services/auth';
import type { TicketPriority, TicketCategory } from '../../types';

interface CreateTicketWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ticketNumber: string) => void;
  defaultShopId?: string;
}

const CATEGORIES: { id: TicketCategory; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'Plumbing', icon: Droplets, label: 'Plumbing' },
  { id: 'Electrical', icon: Zap, label: 'Electrical' },
  { id: 'Air Conditioning', icon: Wind, label: 'HVAC / AC' },
  { id: 'Cleaning', icon: Wrench, label: 'Cleaning' },
  { id: 'Security', icon: Shield, label: 'Security' },
  { id: 'Parking', icon: ParkingCircle, label: 'Parking' },
  { id: 'Internet / Network', icon: Wifi, label: 'Internet' },
  { id: 'Other', icon: MoreHorizontal, label: 'Other' },
];

export const CreateTicketWizard: React.FC<CreateTicketWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultShopId,
}) => {
  const currentUser = auth.getCurrentUser();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Plumbing');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [exactLocation, setExactLocation] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedShopId, setSelectedShopId] = useState(
    currentUser?.shop_id || defaultShopId || db.shops[0]?.id || ''
  );

  if (!isOpen) return null;

  const orgId = currentUser?.organization_id;
  const orgShops = db.shops.filter((s) => !orgId || s.organization_id === orgId);
  const orgProperties = db.properties.filter((p) => !orgId || p.organization_id === orgId);

  const handleNext = () => {
    if (step === 1 && !title.trim()) {
      alert('Please enter a short title for the issue.');
      return;
    }
    if (step < 4) setStep(step + 1);
    else void handleSubmit();
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);

    const resolvedOrg =
      currentUser.organization_id || orgProperties[0]?.organization_id || orgShops[0]?.organization_id || '';
    const prop =
      orgProperties.find((p) => p.id === selectedPropertyId) ||
      orgProperties[0] ||
      db.properties[0];
    const shop =
      orgShops.find((s) => s.id === selectedShopId) ||
      orgShops[0] ||
      db.shops[0];
    const tenant =
      db.tenants.find((t) => t.user_id === currentUser.id) ||
      db.tenants.find((t) => t.organization_id === resolvedOrg) ||
      db.tenants[0];

    if (!resolvedOrg) {
      setIsSubmitting(false);
      alert('Your account is not linked to an organisation.');
      return;
    }
    if (!shop) {
      setIsSubmitting(false);
      alert('Add at least one unit under Centres, Properties & Units before logging a ticket.');
      return;
    }

    const payload = {
      organization_id: resolvedOrg,
      property_id: prop?.id || shop.property_id || '',
      shopping_center_id: prop?.shopping_center_id || shop.shopping_center_id,
      shop_id: shop.id,
      tenant_id: tenant?.id || '',
      title: title.trim() || 'Maintenance issue',
      description: description.trim() || title.trim(),
      exact_location_description: exactLocation,
      priority,
      category,
      created_by_user_id: currentUser.id,
      before_images: uploadedImages,
    };

    const remote = await createTicketRemote(payload);
    if (remote.success && remote.ticket) {
      setIsSubmitting(false);
      onSuccess(remote.ticket.ticket_number);
      onClose();
      return;
    }

    try {
      const ticket = db.createTicket({
        ...payload,
        tenant_id: payload.tenant_id || 'unknown',
        property_id: payload.property_id || shop.property_id || 'unknown',
      });
      setIsSubmitting(false);
      if (remote.error) alert(`Ticket saved locally; server: ${remote.error}`);
      onSuccess(ticket.ticket_number);
      onClose();
    } catch (e) {
      setIsSubmitting(false);
      alert(e instanceof Error ? e.message : remote.error || 'Could not create ticket');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Log Maintenance Ticket</h3>
              <p className="text-[11px] text-slate-500">
                Step {step} of 4
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {step === 1 && (
            <div className="space-y-3">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Issue title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Water leak under basin"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe what is wrong"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`p-2 rounded-xl border text-center ${
                        category === c.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-[10px]">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <label className="block font-semibold">Priority</label>
              {(['Emergency', 'High', 'Medium', 'Low'] as TicketPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`w-full p-3 rounded-xl border text-left font-semibold ${
                    priority === p ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <label className="block font-semibold">Unit</label>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              >
                {orgShops.map((s) => (
                  <option key={s.id} value={s.id}>
                    Unit {s.shop_number}
                  </option>
                ))}
              </select>
              <label className="block font-semibold">Exact location</label>
              <input
                value={exactLocation}
                onChange={(e) => setExactLocation(e.target.value)}
                placeholder="e.g. Rear stockroom, left wall"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div className="font-bold">{title}</div>
              <div className="text-slate-500">{category} · {priority}</div>
              <div className="text-slate-500">{description}</div>
              <p className="text-[11px] text-slate-400 pt-2">
                Submitting saves this ticket to Supabase with an active SLA timer.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
            className="px-3 py-2 rounded-xl border text-xs font-semibold disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4 inline" /> Back
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            {step === 4 ? (isSubmitting ? 'Dispatching…' : 'Dispatch ticket') : 'Continue'}
            {step < 4 && <ChevronRight className="w-4 h-4 inline ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
};

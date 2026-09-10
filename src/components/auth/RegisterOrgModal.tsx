import React, { useState } from 'react';
import { X, Building2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { submitOrganisationRegistration } from '../../services/provisioning';
import { SubscriptionTier } from '../../types';

interface RegisterOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterOrgModal: React.FC<RegisterOrgModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+268 ');
  const [address, setAddress] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [location, setLocation] = useState('');
  const [tier, setTier] = useState<SubscriptionTier>('Professional');

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else void handleSubmit();
  };

  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const result = await submitOrganisationRegistration({
        company_name: companyName,
        owner_name: ownerName,
        email,
        phone,
        address: address || `${propertyName}, ${location}, Eswatini`.trim(),
        subscription_tier: tier,
      });
      if (!result.success) {
        setSubmitError(result.error || 'Registration could not be completed.');
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSubmitted(false);
        setStep(1);
      }, 2800);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Register organisation</h3>
              <p className="text-[11px] text-slate-500">
                Step {step} of 3 · {step === 1 ? 'Company details' : step === 2 ? 'Property overview' : 'Plan'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitError && (
          <div className="mx-6 mt-4 p-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200">{submitError}</div>
        )}

        {submitted ? (
          <div className="p-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white">Application received</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thank you. Your organisation will be reviewed shortly. You will receive access details once it is
              approved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleNext} className="p-6 space-y-4">
            {step === 1 && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Company name</label>
                  <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Owner / contact name</label>
                  <input required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Business address</label>
                  <input required value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary property / centre name</label>
                  <input required value={propertyName} onChange={(e) => setPropertyName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location (city / area)</label>
                  <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Ezulwini, Mbabane, Manzini" className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
                </div>
                <p className="text-[11px] text-slate-500">You can add full unit inventories after approval from your dashboard.</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">Choose a starting plan. You can change this later.</p>
                {(['Starter', 'Professional', 'Enterprise'] as SubscriptionTier[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`w-full text-left p-3 rounded-xl border-2 text-sm ${
                      tier === t
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">{t}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                {step === 3 ? (submitting ? 'Submitting…' : 'Submit application') : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

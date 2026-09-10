import React, { useState } from 'react';
import {
  X,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  ShieldAlert,
  Users,
  Building,
  Check,
  Calculator,
} from 'lucide-react';
import { db } from '../../services/db';
import { submitOrganisationRegistration } from '../../services/provisioning';
import { SubscriptionTier } from '../../types';

interface RegisterOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterOrgModal: React.FC<RegisterOrgModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+268 ');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [staffManagers, setStaffManagers] = useState('2');
  const [staffMaintenance, setStaffMaintenance] = useState('3');
  const [staffFinance, setStaffFinance] = useState('1');
  const [staffGeneral, setStaffGeneral] = useState('4');

  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('Shopping Center / Mall');
  const [location, setLocation] = useState('Ezulwini Valley');
  const [unitCount, setUnitCount] = useState(25);
  const [tenantCount, setTenantCount] = useState(20);
  const [estimatedMonthlyRental, setEstimatedMonthlyRental] = useState(350000);
  const [currentProcess, setCurrentProcess] = useState('WhatsApp groups & Excel sheets');

  const [tier, setTier] = useState<SubscriptionTier>('Professional');

  if (!isOpen) return null;

  const tierBaseFee = tier === 'Starter' ? 1499 : tier === 'Professional' ? 3499 : 6999;
  const operationalVariableFee = Math.round(estimatedMonthlyRental * 0.02);
  const totalEstimatedMonthlyFee = tierBaseFee + operationalVariableFee;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else void handleSubmit();
  };

  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      try {
        db.registerOrganization({
          company_name: companyName,
          owner_name: ownerName,
          email,
          phone,
          address,
        });
      } catch {
        /* optional local */
      }
      const result = await submitOrganisationRegistration({
        company_name: companyName.trim(),
        owner_name: ownerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: (address || `${propertyName}, ${location}`).trim(),
        subscription_tier: tier,
        monthly_fee_estimate: totalEstimatedMonthlyFee,
      });
      if (!result.success) {
        setSubmitError(result.error || 'Could not submit registration.');
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3500);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Register Property Owner / Landlord Organization
              </h3>
              <p className="text-[11px] text-slate-500">
                Step {step} of 3: {step === 1 ? 'Company & Owner' : step === 2 ? 'Property Portfolio' : 'Subscription & Pricing'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitError && (
          <div className="mx-6 mt-3 p-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
            {submitError}
          </div>
        )}

        {submitted ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Application submitted</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Thank you. Your organisation will be reviewed by the platform team. You will be notified when it has been approved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleNext} className="p-6 space-y-4">
            {step === 1 && (
              <div className="space-y-3.5 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company name *</label>
                    <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Owner / contact name *</label>
                    <input required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone *</label>
                    <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Business address *</label>
                  <input required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Managers</label>
                    <input value={staffManagers} onChange={(e) => setStaffManagers(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Maintenance</label>
                    <input value={staffMaintenance} onChange={(e) => setStaffMaintenance(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Finance</label>
                    <input value={staffFinance} onChange={(e) => setStaffFinance(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">General</label>
                    <input value={staffGeneral} onChange={(e) => setStaffGeneral(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3.5 animate-in fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary property / centre name *</label>
                  <input required value={propertyName} onChange={(e) => setPropertyName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Property type</label>
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                      <option>Shopping Center / Mall</option>
                      <option>Strip Mall / Retail Parade</option>
                      <option>Office Park</option>
                      <option>Industrial / Warehouse</option>
                      <option>Mixed Use</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit count</label>
                    <input type="number" value={unitCount} onChange={(e) => setUnitCount(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current tenants</label>
                    <input type="number" value={tenantCount} onChange={(e) => setTenantCount(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Est. monthly rental (SZL)</label>
                    <input type="number" value={estimatedMonthlyRental} onChange={(e) => setEstimatedMonthlyRental(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current operations process</label>
                  <input value={currentProcess} onChange={(e) => setCurrentProcess(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  Choose subscription tier
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['Starter', 'Professional', 'Enterprise'] as SubscriptionTier[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`p-3 rounded-xl border-2 text-left transition ${
                        tier === t
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{t}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {t === 'Starter' ? 'SZL 1,499 base' : t === 'Professional' ? 'SZL 3,499 base' : 'SZL 6,999 base'}
                      </div>
                      {tier === t && <Check className="w-4 h-4 text-blue-600 mt-2" />}
                    </button>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex justify-between"><span>Base fee</span><span className="font-semibold">SZL {tierBaseFee.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Ops variable (~2% of rental)</span><span className="font-semibold">SZL {operationalVariableFee.toLocaleString()}</span></div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1 mt-1 font-bold">
                    <span>Estimated monthly</span>
                    <span>SZL {totalEstimatedMonthlyFee.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 flex items-start gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Final commercial terms are confirmed after Super Admin approval.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5"
              >
                <span>{step === 3 ? (submitting ? 'Submitting…' : 'Submit for Approval') : 'Continue to Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

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

  // Step 1: Company & Owner Details
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

  // Step 2: Property Details
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('Shopping Center / Mall');
  const [location, setLocation] = useState('Ezulwini Valley');
  const [unitCount, setUnitCount] = useState(25);
  const [tenantCount, setTenantCount] = useState(20);
  const [estimatedMonthlyRental, setEstimatedMonthlyRental] = useState(350000);
  const [currentProcess, setCurrentProcess] = useState('WhatsApp groups & Excel sheets');

  // Step 3: Subscription Tier
  const [tier, setTier] = useState<SubscriptionTier>('Professional');

  if (!isOpen) return null;

  // Dynamic fee calculation (Section 61)
  const tierBaseFee = tier === 'Starter' ? 1499 : tier === 'Professional' ? 3499 : 6999;
  const operationalVariableFee = Math.round(estimatedMonthlyRental * 0.02);
  const totalEstimatedMonthlyFee = tierBaseFee + operationalVariableFee;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    // Register organization with status Pending Approval
    const org = db.registerOrganization({
      company_name: companyName,
      owner_name: ownerName,
      email,
      phone,
      address,
      subscription_tier: tier,
      monthly_fee_estimate: totalEstimatedMonthlyFee,
      preferred_username: username || companyName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      initial_property: {
        name: propertyName,
        type: propertyType,
        location,
        unit_count: Number(unitCount),
        tenant_count: Number(tenantCount),
      },
    });

    setSubmitted(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Modal Header */}
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
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-xl text-slate-900 dark:text-white">
              Application Submitted for Approval
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Your organization <strong className="text-slate-900 dark:text-white">{companyName}</strong> has been registered with status <span className="text-amber-600 font-semibold">Pending Approval</span>. The Super Admin has received an alert and will review your commercial license and issue your unique Organization Code.
            </p>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs text-blue-700 dark:text-blue-300 max-w-md mx-auto">
              Tip: You can switch to the <strong>Super Admin</strong> demo view at any time to review and approve this pending application!
            </div>
          </div>
        ) : (
          <form onSubmit={handleNext} className="p-6 space-y-5">
            {/* STEP 1: COMPANY & OWNER */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Organization / Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Ezulwini Valley Commercial Properties Ltd"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Managing Director / Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Lindiwe Dlamini"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="lindiwe@ezulwiniholdings.sz"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Phone (Eswatini) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+268 7600 0000"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Head Office Physical Address (Eswatini) *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Suite 402, Ezulwini Commercial Plaza, MR103 Road"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Preferred Admin Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin_lindiwe"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Portal Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Staff Breakdown Requirement #61 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Estimated Operational Staff Breakdown</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500">Property Managers</span>
                      <input
                        type="number"
                        min="1"
                        value={staffManagers}
                        onChange={(e) => setStaffManagers(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none mt-1"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500">Maintenance Techs</span>
                      <input
                        type="number"
                        min="1"
                        value={staffMaintenance}
                        onChange={(e) => setStaffMaintenance(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none mt-1"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500">Finance Officers</span>
                      <input
                        type="number"
                        min="0"
                        value={staffFinance}
                        onChange={(e) => setStaffFinance(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none mt-1"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500">General Staff</span>
                      <input
                        type="number"
                        min="0"
                        value={staffGeneral}
                        onChange={(e) => setStaffGeneral(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PROPERTY DETAILS */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Property / Shopping Center *
                    </label>
                    <input
                      type="text"
                      required
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      placeholder="e.g. The Gables Shopping Centre"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Property Category
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Shopping Center / Mall">Shopping Center / Mall</option>
                      <option value="Commercial Office Park">Commercial Office Park</option>
                      <option value="Industrial Logistics Park">Industrial Logistics Park</option>
                      <option value="Mixed-use Retail & Office">Mixed-use Retail & Office</option>
                      <option value="Strip Mall">Strip Mall / Convenience Center</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Location in Eswatini
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Ezulwini Valley">Ezulwini Valley</option>
                      <option value="Mbabane Central">Mbabane Central</option>
                      <option value="Manzini City">Manzini City</option>
                      <option value="Matsapha Industrial">Matsapha Industrial</option>
                      <option value="Nhlangano">Nhlangano</option>
                      <option value="Piggs Peak">Piggs Peak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Units
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={unitCount}
                      onChange={(e) => setUnitCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Active Tenants
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={tenantCount}
                      onChange={(e) => setTenantCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Monthly Rent Roll (E) *
                    </label>
                    <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-400 mr-2">E</span>
                      <input
                        type="number"
                        min="1000"
                        step="1000"
                        value={estimatedMonthlyRental}
                        onChange={(e) => setEstimatedMonthlyRental(Number(e.target.value))}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Current Maintenance Process
                    </label>
                    <select
                      value={currentProcess}
                      onChange={(e) => setCurrentProcess(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="WhatsApp groups & Excel sheets">WhatsApp groups & Excel sheets</option>
                      <option value="Paper forms & logbooks">Paper forms & logbooks</option>
                      <option value="Phone calls & walk-ins">Phone calls & walk-ins</option>
                      <option value="Outdated legacy software">Outdated legacy software</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SUBSCRIPTION & PRICING PREVIEW */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Starter */}
                  <div
                    onClick={() => setTier('Starter')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      tier === 'Starter'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Starter</div>
                    <div className="text-lg font-extrabold text-blue-600 mt-1">E1,499<span className="text-[10px] text-slate-500 font-normal">/mo base</span></div>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mt-2">
                      <li>• Up to 3 properties</li>
                      <li>• 100 tenants</li>
                      <li>• 10 staff logins</li>
                      <li>• 10 GB storage</li>
                    </ul>
                  </div>

                  {/* Professional */}
                  <div
                    onClick={() => setTier('Professional')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition relative ${
                      tier === 'Professional'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="absolute -top-2 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                      POPULAR
                    </span>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Professional</div>
                    <div className="text-lg font-extrabold text-blue-600 mt-1">E3,499<span className="text-[10px] text-slate-500 font-normal">/mo base</span></div>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mt-2">
                      <li>• Up to 10 properties</li>
                      <li>• 500 tenants</li>
                      <li>• 30 staff logins</li>
                      <li>• 50 GB storage</li>
                    </ul>
                  </div>

                  {/* Enterprise */}
                  <div
                    onClick={() => setTier('Enterprise')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      tier === 'Enterprise'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Enterprise</div>
                    <div className="text-lg font-extrabold text-blue-600 mt-1">E6,999<span className="text-[10px] text-slate-500 font-normal">/mo base</span></div>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mt-2">
                      <li>• Unlimited properties</li>
                      <li>• Unlimited tenants</li>
                      <li>• Unlimited staff</li>
                      <li>• Dedicated SLA & training</li>
                    </ul>
                  </div>
                </div>

                {/* Dynamic Fee Formula Preview (Requirement #61) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <span>Dynamic Commercial Fee Calculation Preview</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Formula: Fixed Base Tier Rate + (Estimated Monthly Rent Roll × 2% Platform Management Fee)
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500">Tier Base Fee</div>
                      <div className="font-bold text-slate-900 dark:text-white">E{tierBaseFee.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Rent Roll Fee (2%)</div>
                      <div className="font-bold text-slate-900 dark:text-white">E{operationalVariableFee.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Total Monthly Est.</div>
                      <div className="font-extrabold text-blue-600 text-sm">E{totalEstimatedMonthlyFee.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
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
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
                >
                  <span>{step === 3 ? 'Submit for Super Admin Approval' : 'Continue to Next Step'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

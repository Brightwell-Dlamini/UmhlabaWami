import React, { useState } from 'react';
import { X, Lock, Building, User, KeyRound, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { auth } from '../../services/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegisterOrg?: () => void;
  onRegisterClick?: () => void;
  onLoginSuccess?: () => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Tenant', orgCode: 'GAB-070826', username: 'nandi.tenant' },
  { label: 'Property Manager', orgCode: 'GAB-070826', username: 'sipho.manager' },
  { label: 'Maintenance', orgCode: 'GAB-070826', username: 'bheki.maintenance' },
  { label: 'Finance Lead', orgCode: 'GAB-070826', username: 'thandeka.finance' },
  { label: 'Client Admin', orgCode: 'GAB-070826', username: 'lindiwe.admin' },
  { label: 'Super Admin', orgCode: 'SUPER', username: 'superadmin', danger: true },
] as const;

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenRegisterOrg,
  onRegisterClick,
  onLoginSuccess,
}) => {
  const [orgCode, setOrgCode] = useState('GAB-070826');
  const [username, setUsername] = useState('nandi.tenant');
  const [password, setPassword] = useState('password123');
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const openRegister = () => {
    onClose();
    if (onOpenRegisterOrg) onOpenRegisterOrg();
    else if (onRegisterClick) onRegisterClick();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isCaptchaChecked) {
      setErrorMsg('Please confirm you are not a robot by checking the security verification.');
      return;
    }

    if (!orgCode.trim() || !username.trim()) {
      setErrorMsg('Organisation code and username are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await auth.loginAsync(orgCode, username, password);
      if (res.success) {
        onLoginSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.error || 'Login failed. Check organisation code and username.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected login error.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (code: string, user: string) => {
    setOrgCode(code);
    setUsername(user);
    setPassword('password123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Sign In to Umhlaba Wami</h3>
              <p className="text-[11px] text-slate-500">Multi-tenant operational access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Organisation Code *</label>
                <span className="text-[10px] text-slate-400">e.g. GAB-070826 or SUPER</span>
              </div>
              <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600">
                <Building className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                  placeholder="ORG-CODE"
                  className="w-full bg-transparent text-xs font-mono font-medium text-slate-900 dark:text-white uppercase focus:outline-none"
                  autoComplete="organization"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username or Email *</label>
              <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600">
                <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password *</label>
                <span className="text-[10px] text-slate-400">Demo: any value · Supabase: real password</span>
              </div>
              <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600">
                <KeyRound className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isCaptchaChecked}
                  onChange={(e) => setIsCaptchaChecked(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>I am not a robot (demo verification)</span>
              </label>
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/25 transition"
            >
              {loading ? 'Verifying credentials…' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>One-click demo accounts (match seed data)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.username}
                  type="button"
                  onClick={() => handleQuickDemo(acct.orgCode, acct.username)}
                  className={`p-1.5 text-left rounded-lg transition ${
                    'danger' in acct && acct.danger
                      ? 'bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-700 dark:text-red-300'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-semibold">{acct.label}</div>
                  <div className={`text-[10px] font-mono ${'danger' in acct && acct.danger ? 'text-red-400' : 'text-slate-400'}`}>
                    {acct.username}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1 text-center text-xs text-slate-500">
            <span>Commercial property owner or landlord? </span>
            <button type="button" onClick={openRegister} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Register Organisation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

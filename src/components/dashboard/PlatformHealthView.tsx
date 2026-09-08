import React, { useEffect, useState } from 'react';
import { HeartPulse, Smartphone } from 'lucide-react';
import { partnerApi } from '../../services/partnerApi';
import { db } from '../../services/db';

export const PlatformHealthView: React.FC = () => {
  const [health, setHealth] = useState(partnerApi.health());
  const [swState, setSwState] = useState('checking…');
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setHealth(partnerApi.health());
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        setSwState(reg ? `active (${reg.active?.state || 'registered'})` : 'not registered');
      });
    } else {
      setSwState('unsupported');
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    setDeferred(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Platform health</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Reliability signals, PWA status, and install readiness.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-[10px] uppercase font-bold text-slate-500">API</div>
          <div className="text-lg font-extrabold text-emerald-600">{health.ok ? 'Healthy' : 'Down'}</div>
          <div className="text-[10px] text-slate-400">{(health.data as { mode?: string })?.mode || '—'}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-[10px] uppercase font-bold text-slate-500">Service worker</div>
          <div className="text-sm font-bold mt-1">{swState}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-[10px] uppercase font-bold text-slate-500">Demo entities</div>
          <div className="text-sm font-bold mt-1">
            {db.tickets.length} tickets · {db.tenants.length} tenants · {db.shops.length} units
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-blue-400" />
          <div>
            <div className="font-bold">Install as app (PWA)</div>
            <div className="text-xs text-slate-300">
              Add Umhlaba Wami to your home screen for field technicians and managers.
            </div>
          </div>
        </div>
        <button
          onClick={install}
          disabled={!deferred}
          className="px-4 py-2 rounded-xl bg-blue-600 disabled:opacity-40 text-xs font-bold"
        >
          {deferred ? 'Install' : 'Use browser Install menu'}
        </button>
      </div>
    </div>
  );
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

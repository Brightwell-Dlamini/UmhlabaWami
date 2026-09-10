import React from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AlertTriangle, Database } from 'lucide-react';

/** Blocks the app when Supabase env vars are missing (production requirement). */
export const ConfigGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isSupabaseConfigured) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="max-w-lg w-full rounded-2xl border border-amber-500/40 bg-slate-900 p-8 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-amber-400">
          <Database className="w-8 h-8" />
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold">Supabase configuration required</h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Umhlaba Wami runs in <strong>Supabase-only</strong> mode. Set the following environment
          variables on Vercel (and redeploy) or in <code className="text-amber-300">.env.local</code>:
        </p>
        <ul className="text-xs font-mono space-y-1 text-slate-200 bg-slate-950/80 rounded-xl p-4 border border-slate-700">
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_ANON_KEY</li>
        </ul>
        <p className="text-xs text-slate-400">
          See <span className="text-blue-400">docs/GO_LIVE_SUPABASE.md</span> and{' '}
          <span className="text-blue-400">docs/PRODUCTION_READINESS.md</span>.
        </p>
      </div>
    </div>
  );
};

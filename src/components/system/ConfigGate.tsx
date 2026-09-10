import React from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AlertTriangle, Database } from 'lucide-react';

/** Blocks the app when backend env vars are missing. */
export const ConfigGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isSupabaseConfigured) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="max-w-lg w-full rounded-2xl border border-amber-500/40 bg-slate-900 p-8 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-amber-400">
          <Database className="w-8 h-8" />
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold">Service configuration required</h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          This deployment is missing required server settings. An administrator must configure the
          application environment and redeploy.
        </p>
      </div>
    </div>
  );
};

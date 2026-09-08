import React, { useState } from 'react';
import { Palette, CheckCircle2 } from 'lucide-react';
import { branding, BrandingConfig } from '../../services/brandingService';
import { auth } from '../../services/auth';

export const WhiteLabelView: React.FC = () => {
  const user = auth.getCurrentUser();
  const orgId = user?.organization_id || 'org_gables_lifestyle';
  const [cfg, setCfg] = useState<BrandingConfig>(() => branding.get(orgId));
  const [notice, setNotice] = useState('');

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    branding.save({ ...cfg, organization_id: orgId });
    setNotice('Branding applied across the workspace (CSS variables + org record).');
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">White-label branding</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Organisation display name, primary colour, and logo URL. Custom domain is recorded as a hint for
          Phase 6 ops setup.
        </p>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <form onSubmit={save} className="max-w-lg space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
        <div>
          <label className="font-semibold block mb-1">Display name</label>
          <input
            value={cfg.display_name}
            onChange={(e) => setCfg({ ...cfg, display_name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold block mb-1">Primary colour</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={cfg.primary_color}
                onChange={(e) => setCfg({ ...cfg, primary_color: e.target.value })}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer"
              />
              <input
                value={cfg.primary_color}
                onChange={(e) => setCfg({ ...cfg, primary_color: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="font-semibold block mb-1">Accent</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={cfg.accent_color}
                onChange={(e) => setCfg({ ...cfg, accent_color: e.target.value })}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer"
              />
              <input
                value={cfg.accent_color}
                onChange={(e) => setCfg({ ...cfg, accent_color: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="font-semibold block mb-1">Logo URL (optional)</label>
          <input
            value={cfg.logo_url || ''}
            onChange={(e) => setCfg({ ...cfg, logo_url: e.target.value })}
            placeholder="https://…"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Support email</label>
          <input
            value={cfg.support_email || ''}
            onChange={(e) => setCfg({ ...cfg, support_email: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Custom domain hint</label>
          <input
            value={cfg.custom_domain_hint || ''}
            onChange={(e) => setCfg({ ...cfg, custom_domain_hint: e.target.value })}
            placeholder="manage.yourcentre.co.sz"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
          />
        </div>

        <div
          className="p-4 rounded-xl text-white"
          style={{ background: `linear-gradient(135deg, ${cfg.primary_color}, ${cfg.accent_color})` }}
        >
          <div className="text-[10px] uppercase tracking-widest opacity-80">Preview</div>
          <div className="text-lg font-bold">{cfg.display_name}</div>
          <div className="text-xs opacity-90">{cfg.support_email || 'support@example.com'}</div>
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl">
          Save & apply branding
        </button>
      </form>
    </div>
  );
};

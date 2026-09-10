import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, Shield } from 'lucide-react';
import { intelligence, PermissionKey } from '../../services/intelligenceService';
import { auth } from '../../services/auth';
import { db } from '../../services/db';
import type { UserRole } from '../../types';

const ROLES: UserRole[] = [
  'tenant',
  'maintenance',
  'property_manager',
  'finance',
  'admin',
  'super_admin',
];

export const PermissionsView: React.FC = () => {
  const current = auth.getCurrentUser();
  const catalog = intelligence.listPermissionCatalog();
  const [selectedRole, setSelectedRole] = useState<UserRole>('property_manager');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notice, setNotice] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = db.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const orgUsers =
    current?.role === 'super_admin'
      ? db.users.filter((u) => u.role !== 'super_admin')
      : db.users.filter((u) => u.organization_id === current?.organization_id);

  const rolePerms = intelligence.getPermissionsForRole(selectedRole);
  const user = orgUsers.find((u) => u.id === selectedUserId);
  const effective = user
    ? intelligence.getEffectivePermissions(user.id, user.role)
    : rolePerms;

  const toggleOverride = (key: PermissionKey) => {
    if (!user) {
      setNotice('Select a user to set personal overrides.');
      setTimeout(() => setNotice(''), 2500);
      return;
    }
    const base = intelligence.getPermissionsForRole(user.role);
    let next = intelligence.getEffectivePermissions(user.id, user.role);
    if (next.includes(key)) next = next.filter((k) => k !== key);
    else next = [...next, key];
    const extras = next.filter((k) => !base.includes(k));
    intelligence.setUserPermissionOverrides(user.id, extras);
    setNotice(`Permissions updated for ${user.name}`);
    setTick((t) => t + 1);
    setTimeout(() => setNotice(''), 2500);
  };

  const groups = Array.from(new Set(catalog.map((c) => c.group)));

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Permissions</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review role defaults and grant extra capabilities to individual users. Super Admin retains full platform access.
        </p>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
          <label className="text-[10px] font-bold uppercase text-slate-500">Inspect role defaults</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <label className="text-[10px] font-bold uppercase text-slate-500">User override (optional)</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
          >
            <option value="">— Role defaults only —</option>
            {orgUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.replace(/_/g, ' ')})
              </option>
            ))}
          </select>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500 flex gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            {user
              ? `Editing extras for ${user.name}. Base role: ${user.role.replace(/_/g, ' ')}.`
              : `Showing default permissions for ${selectedRole.replace(/_/g, ' ')}.`}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {groups.map((group) => (
            <div
              key={group}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">{group}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {catalog
                  .filter((c) => c.group === group)
                  .map((c) => {
                    const on = effective.includes(c.key);
                    const isBase = rolePerms.includes(c.key);
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => toggleOverride(c.key)}
                        className={`text-left p-3 rounded-xl border text-xs transition ${
                          on
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                            : 'border-slate-200 dark:border-slate-700 opacity-70'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between gap-2">
                          <span>{c.label}</span>
                          {on && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{c.description}</div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">{c.key}</div>
                        {user && !isBase && on && (
                          <div className="text-[10px] text-amber-600 mt-1 font-semibold">User grant</div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

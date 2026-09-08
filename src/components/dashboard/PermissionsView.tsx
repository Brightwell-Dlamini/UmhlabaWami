import React, { useState } from 'react';
import { KeyRound, CheckCircle2 } from 'lucide-react';
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

  const orgUsers = db.users.filter(
    (u) =>
      current?.role === 'super_admin' ||
      u.organization_id === current?.organization_id ||
      u.role === 'super_admin'
  );

  const rolePerms = intelligence.getPermissionsForRole(selectedRole);
  const user = orgUsers.find((u) => u.id === selectedUserId);
  const effective = user
    ? intelligence.getEffectivePermissions(user.id, user.role)
    : rolePerms;

  const toggleOverride = (key: PermissionKey) => {
    if (!user) return;
    const base = intelligence.getPermissionsForRole(user.role);
    let next = intelligence.getEffectivePermissions(user.id, user.role);
    if (next.includes(key)) {
      next = next.filter((k) => k !== key);
    } else {
      next = [...next, key];
    }
    // Store only extras beyond base
    const extras = next.filter((k) => !base.includes(k));
    intelligence.setUserPermissionOverrides(user.id, extras);
    setNotice(`Updated overrides for ${user.name}`);
    setTimeout(() => setNotice(''), 2500);
  };

  const groups = Array.from(new Set(catalog.map((c) => c.group)));

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Granular Permissions
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Role defaults plus optional per-user grants. Platform operators can extend access without
          changing the base role.
        </p>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRole(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize ${
              selectedRole === r
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {r.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <h2 className="text-sm font-bold mb-2 capitalize">Default: {selectedRole.replace(/_/g, ' ')}</h2>
        <div className="flex flex-wrap gap-1.5">
          {rolePerms.map((p) => (
            <span
              key={p}
              className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-semibold"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
        <h2 className="text-sm font-bold">Per-user overrides</h2>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full max-w-md px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
        >
          <option value="">Select user…</option>
          {orgUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>

        {user &&
          groups.map((g) => (
            <div key={g}>
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">{g}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {catalog
                  .filter((c) => c.group === g)
                  .map((c) => {
                    const on = effective.includes(c.key);
                    const isBase = intelligence.getPermissionsForRole(user.role).includes(c.key);
                    return (
                      <label
                        key={c.key}
                        className="flex items-center gap-2 text-xs p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          disabled={isBase || (current?.role !== 'admin' && current?.role !== 'super_admin')}
                          onChange={() => toggleOverride(c.key)}
                        />
                        <span>
                          {c.label}{' '}
                          {isBase && <span className="text-[10px] text-slate-400">(role default)</span>}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

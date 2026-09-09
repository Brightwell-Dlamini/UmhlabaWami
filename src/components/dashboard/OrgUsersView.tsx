import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  UserCheck,
  Shield,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types';

export const OrgUsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([...db.users]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('property_manager');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');
  const [notice, setNotice] = useState('');

  const currentUser = auth.getCurrentUser();

  useEffect(() => {
    const refresh = () => setUsers([...db.users]);
    const unsub = db.subscribe(refresh);
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setUsername('');
    setRole('property_manager');
    setStatus('Active');
    setShowAddModal(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    setUsername(u.username);
    setRole(u.role);
    setStatus((u.status as 'Active' | 'Inactive' | 'Suspended') || 'Active');
    setShowAddModal(true);
  };

  const persistLocal = () => {
    try {
      (db as unknown as { saveToStorage?: () => void }).saveToStorage?.();
    } catch {
      /* ignore */
    }
    try {
      (db as unknown as { notifyListeners?: () => void }).notifyListeners?.();
    } catch {
      /* ignore */
    }
    setUsers([...db.users]);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSaving(true);

    const resolvedUsername =
      username.trim() || email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/gi, '');
    const resolvedPhone = phone.trim() || '+268 7600 0000';

    try {
      if (editingUser) {
        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase
            .from('users')
            .update({
              name: name.trim(),
              email: email.trim(),
              phone: resolvedPhone,
              username: resolvedUsername,
              role,
              status,
            })
            .eq('id', editingUser.id);
          if (error) throw error;
        }
        const idx = db.users.findIndex((u) => u.id === editingUser.id);
        if (idx !== -1) {
          db.users[idx] = {
            ...db.users[idx],
            name: name.trim(),
            email: email.trim(),
            phone: resolvedPhone,
            username: resolvedUsername,
            role,
            status,
          };
          persistLocal();
        }
        setNotice(`Updated ${name.trim()}.`);
      } else {
        // New staff
        const orgId =
          role === 'super_admin'
            ? undefined
            : currentUser?.organization_id ||
              db.organizations.find((o) => o.organization_code === 'GAB-070826')?.id ||
              db.organizations[0]?.id;

        let newId = `usr_${Date.now()}`;

        if (isSupabaseConfigured && supabase) {
          // Let Postgres generate UUID; we need returning id
          const payload: Record<string, unknown> = {
            organization_id: role === 'super_admin' ? null : orgId || null,
            username: resolvedUsername,
            name: name.trim(),
            email: email.trim(),
            phone: resolvedPhone,
            role,
            status,
          };
          const { data, error } = await supabase.from('users').insert(payload).select('*').single();
          if (error) throw error;
          newId = data.id;

          const remoteUser = data as User;
          db.users.push(remoteUser);
          persistLocal();
          setNotice(
            `Profile created for ${name.trim()}. Next: Supabase Auth → Add user with email ${email.trim()} and metadata role "${role}", username "${resolvedUsername}"${orgId ? `, organization_id "${orgId}"` : ''}.`
          );
        } else {
          const newUser: User = {
            id: newId,
            organization_id: orgId,
            username: resolvedUsername,
            name: name.trim(),
            email: email.trim(),
            phone: resolvedPhone,
            role,
            status,
            created_at: new Date().toISOString(),
          };
          db.users.push(newUser);
          persistLocal();
          setNotice(`Staff account for ${name.trim()} created (demo mode).`);
        }
      }

      setTimeout(() => setNotice(''), 8000);
      setShowAddModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setNotice(`Could not save user: ${msg}`);
      setTimeout(() => setNotice(''), 6000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (!window.confirm(`Remove user ${u.name}?`)) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('users').delete().eq('id', u.id);
        if (error) throw error;
      }
      const idx = db.users.findIndex((item) => item.id === u.id);
      if (idx !== -1) {
        db.users.splice(idx, 1);
        persistLocal();
      }
      setNotice(`User ${u.name} removed.`);
      setTimeout(() => setNotice(''), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setNotice(`Delete failed: ${msg}`);
    }
  };

  const handleToggleStatus = async (u: User) => {
    const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('users').update({ status: nextStatus }).eq('id', u.id);
        if (error) throw error;
      }
      const idx = db.users.findIndex((item) => item.id === u.id);
      if (idx !== -1) {
        db.users[idx].status = nextStatus;
        persistLocal();
      }
      setNotice(`${u.name}'s status → ${nextStatus}.`);
      setTimeout(() => setNotice(''), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setNotice(`Status update failed: ${msg}`);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Organization Staff & User Roles
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage staff profiles. In Supabase mode, also create a matching Auth user with the same email.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Invite Staff Member</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search staff by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-xs"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.username}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold capitalize">
                      <Shield className="w-3 h-3" />
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {u.email}
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Phone className="w-3 h-3" /> {u.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(u)}
                      className="inline-flex p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="inline-flex p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    No staff profiles yet. Add one, then create the matching Auth user with the same email.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingUser ? 'Edit staff' : 'Invite staff member'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Full name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Email (must match Auth)</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Username (login)</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="auto from email if empty" className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
                  <option value="property_manager">Property manager</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="finance">Finance</option>
                  <option value="admin">Org admin</option>
                  <option value="tenant">Tenant</option>
                  {currentUser?.role === 'super_admin' && <option value="super_admin">Super admin</option>}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive' | 'Suspended')} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold"
              >
                {saving ? 'Saving…' : editingUser ? 'Save changes' : 'Create profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

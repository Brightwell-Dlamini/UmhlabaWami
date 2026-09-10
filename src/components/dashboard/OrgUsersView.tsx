import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  Mail,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { createStaffUser } from '../../services/provisioning';
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
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('property_manager');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');
  const [notice, setNotice] = useState('');

  const currentUser = auth.getCurrentUser();

  useEffect(() => {
    const unsub = db.subscribe(() => setUsers([...db.users]));
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setUsername('');
    setPassword('');
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
    db.saveToStorage();
    setUsers([...db.users]);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    setNotice('');

    const resolvedUsername =
      username.trim() || email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/gi, '');
    const resolvedPhone = phone.trim() || undefined;

    try {
      if (editingUser) {
        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase
            .from('users')
            .update({
              name: name.trim(),
              email: email.trim().toLowerCase(),
              phone: resolvedPhone || null,
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
            email: email.trim().toLowerCase(),
            phone: resolvedPhone,
            username: resolvedUsername,
            role,
            status,
          };
          persistLocal();
        }
        setNotice(`Updated ${name.trim()}.`);
      } else {
        const orgId = currentUser?.organization_id;
        if (!orgId) {
          setNotice('Your account is not linked to an organisation.');
          setSaving(false);
          return;
        }
        if (!password || password.length < 8) {
          setNotice('Set a temporary password of at least 8 characters.');
          setSaving(false);
          return;
        }
        const result = await createStaffUser({
          organization_id: orgId,
          name: name.trim(),
          email: email.trim(),
          username: resolvedUsername,
          phone: resolvedPhone,
          role,
          password,
        });
        if (!result.success) {
          setNotice(result.error || 'Could not create user.');
          setSaving(false);
          return;
        }
        setNotice(
          `${name.trim()} can sign in with your organisation code, username “${resolvedUsername}”, and the password you set.`
        );
      }
      setShowAddModal(false);
      setTimeout(() => setNotice(''), 8000);
    } catch (err: unknown) {
      setNotice(err instanceof Error ? err.message : 'Could not save user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (!window.confirm(`Remove ${u.name}?`)) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('users').delete().eq('id', u.id);
        if (error) throw error;
      }
      db.users = db.users.filter((item) => item.id !== u.id);
      persistLocal();
      setNotice(`${u.name} removed.`);
    } catch (err: unknown) {
      setNotice(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const filtered = users.filter((u) => {
    if (currentUser?.organization_id && u.organization_id !== currentUser.organization_id && u.role !== 'super_admin') {
      if (currentUser.role !== 'super_admin') return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Team
          </h2>
          <p className="text-xs text-slate-500">Create and manage staff accounts for your organisation.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          <PlusCircle className="w-4 h-4" /> Add user
        </button>
      </div>

      {notice && (
        <div className="p-3 text-xs rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-900">
          {notice}
        </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or username"
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{u.username}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</div>
                  {u.phone && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <Phone className="w-3 h-3" /> {u.phone}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 capitalize">{u.role.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">{u.status}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button type="button" onClick={() => openEditModal(u)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => handleDeleteUser(u)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No users yet. Add your first team member.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingUser ? 'Edit user' : 'Add user'}
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Full name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Login username" className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              </div>
              {!editingUser && (
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Temporary password</label>
                  <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                  <p className="text-[10px] text-slate-500 mt-1">Share this securely for their first sign-in.</p>
                </div>
              )}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
                  <option value="admin">Organisation admin</option>
                  <option value="property_manager">Property manager</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="finance">Finance</option>
                  <option value="tenant">Tenant</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl disabled:opacity-60">
                {saving ? 'Saving…' : editingUser ? 'Save changes' : 'Create user'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

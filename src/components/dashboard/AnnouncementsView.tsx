import React, { useState, useEffect } from 'react';
import { Megaphone, PlusCircle, Trash2, X, CheckCircle2 } from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import {
  createAnnouncementRemote,
  updateAnnouncementRemote,
  deleteAnnouncementRemote,
} from '../../services/orgDataService';
import type { Announcement } from '../../types';

export const AnnouncementsView: React.FC = () => {
  const currentUser = auth.getCurrentUser();
  const orgId = currentUser?.organization_id;
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    [...db.announcements].filter((a) => !orgId || a.organization_id === orgId)
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [notice, setNotice] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<Announcement['priority']>('General');
  const [targetAudience, setTargetAudience] =
    useState<Announcement['target_audience']>('All Tenants');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const refresh = () =>
      setAnnouncements(
        [...db.announcements].filter((a) => !orgId || a.organization_id === orgId)
      );
    return db.subscribe(refresh);
  }, [orgId]);

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setMessage('');
    setPriority('General');
    setTargetAudience('All Tenants');
    setShowCreateModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    if (!orgId) {
      setNotice('Not linked to an organisation.');
      return;
    }
    setSaving(true);
    if (editing) {
      const res = await updateAnnouncementRemote(editing.id, {
        title: title.trim(),
        message: message.trim(),
        priority,
        target_audience: targetAudience,
      });
      setSaving(false);
      if (!res.success) {
        setNotice(res.error || 'Update failed');
        return;
      }
      setNotice('Announcement updated.');
    } else {
      const res = await createAnnouncementRemote({
        organization_id: orgId,
        title: title.trim(),
        message: message.trim(),
        priority,
        target_audience: targetAudience,
        created_by_name: currentUser?.name || 'Management',
      });
      setSaving(false);
      if (!res.success) {
        setNotice(res.error || 'Could not publish announcement');
        return;
      }
      setNotice('Announcement published.');
    }
    setShowCreateModal(false);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleDelete = async (a: Announcement) => {
    if (!window.confirm(`Delete "${a.title}"?`)) return;
    const res = await deleteAnnouncementRemote(a.id);
    if (!res.success) setNotice(res.error || 'Delete failed');
    else setNotice('Announcement removed.');
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" /> Company Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-1">Published to your organisation in Supabase.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white"
        >
          <PlusCircle className="w-3.5 h-3.5" /> New announcement
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="space-y-2">
        {announcements.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500 border border-dashed rounded-2xl">
            No announcements yet.
          </div>
        )}
        {announcements.map((a) => (
          <div
            key={a.id}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <div className="flex justify-between gap-2">
              <div>
                <div className="font-bold text-sm">{a.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {a.priority} · {a.target_audience} · {a.created_by_name}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{a.message}</p>
              </div>
              <button type="button" onClick={() => void handleDelete(a)} className="text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70">
          <form
            onSubmit={(e) => void handleSave(e)}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-3 shadow-2xl"
          >
            <div className="flex justify-between">
              <h3 className="font-bold text-sm">{editing ? 'Edit' : 'New'} announcement</h3>
              <button type="button" onClick={() => setShowCreateModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Title *</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Message *</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Announcement['priority'])}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="General">General</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) =>
                    setTargetAudience(e.target.value as Announcement['target_audience'])
                  }
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="All Tenants">All Tenants</option>
                  <option value="All Staff">All Staff</option>
                  <option value="Everyone">Everyone</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-blue-600 text-white"
            >
              {saving ? 'Saving…' : 'Publish'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

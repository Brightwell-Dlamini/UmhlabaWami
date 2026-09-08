import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  PlusCircle,
  AlertTriangle,
  Radio,
  Calendar,
  User,
  CheckCircle2,
  Trash2,
  Edit3,
  Search,
  X,
  Eye,
  Archive,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { Announcement } from '../../types';

export const AnnouncementsView: React.FC = () => {
  const currentUser = auth.getCurrentUser();
  const [announcements, setAnnouncements] = useState<Announcement[]>([...db.announcements]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [notice, setNotice] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<Announcement['priority']>('General');
  const [targetAudience, setTargetAudience] = useState<Announcement['target_audience']>('All Tenants');

  useEffect(() => {
    const refresh = () => setAnnouncements([...db.announcements]);
    const unsub = db.subscribe(refresh);
    return () => unsub();
  }, []);

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    setTitle('');
    setMessage('');
    setPriority('General');
    setTargetAudience('All Tenants');
    setShowCreateModal(true);
  };

  const openEditModal = (a: Announcement) => {
    setEditingAnnouncement(a);
    setTitle(a.title);
    setMessage(a.message);
    setPriority(a.priority);
    setTargetAudience(a.target_audience);
    setShowCreateModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (editingAnnouncement) {
      const idx = db.announcements.findIndex((a) => a.id === editingAnnouncement.id);
      if (idx !== -1) {
        db.announcements[idx] = {
          ...db.announcements[idx],
          title: title.trim(),
          message: message.trim(),
          priority,
          target_audience: targetAudience,
        };
        db.saveToStorage();
        setNotice('Announcement updated successfully!');
      }
    } else {
      const newAnn: Announcement = {
        id: `ann_${Date.now()}`,
        organization_id: 'org_gables_lifestyle',
        property_id: 'prop_gables_retail',
        title: title.trim(),
        message: message.trim(),
        priority,
        target_audience: targetAudience,
        created_by_name: currentUser?.name || 'Center Management',
        created_at: new Date().toISOString(),
        is_active: true,
      };

      db.announcements.unshift(newAnn);
      db.saveToStorage();
      setNotice('Center announcement successfully broadcast to tenant portals!');
    }

    setAnnouncements([...db.announcements]);
    setTimeout(() => setNotice(''), 3000);
    setShowCreateModal(false);
  };

  const handleDelete = (a: Announcement) => {
    if (window.confirm(`Delete announcement "${a.title}"?`)) {
      const idx = db.announcements.findIndex((item) => item.id === a.id);
      if (idx !== -1) {
        db.announcements.splice(idx, 1);
        db.saveToStorage();
        setAnnouncements([...db.announcements]);
        setNotice('Announcement removed.');
        setTimeout(() => setNotice(''), 3000);
      }
    }
  };

  const handleToggleActive = (id: string) => {
    const ann = db.announcements.find((a) => a.id === id);
    if (ann) {
      ann.is_active = !ann.is_active;
      db.saveToStorage();
      setAnnouncements([...db.announcements]);
      setNotice(ann.is_active ? 'Announcement reinstated.' : 'Announcement archived.');
      setTimeout(() => setNotice(''), 2500);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    if (selectedPriority !== 'All' && a.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(query) ||
        a.message.toLowerCase().includes(query) ||
        a.created_by_name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Center Announcements & Bulletins
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Broadcast scheduled maintenance, facility advisories, and operational notices to tenants
          </p>
        </div>

        {currentUser?.role !== 'tenant' && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Announcement</span>
          </button>
        )}
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'General', 'Important', 'Emergency'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriority(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                selectedPriority === p
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {p} ({p === 'All' ? announcements.length : announcements.filter((a) => a.priority === p).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bulletins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
            No announcements found matching your filter criteria.
          </div>
        ) : (
          filteredAnnouncements.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition shadow-sm ${
                a.is_active
                  ? 'border-slate-200 dark:border-slate-700'
                  : 'border-dashed border-slate-300 dark:border-slate-700 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      a.priority === 'Emergency'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        : a.priority === 'Important'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}
                  >
                    {a.priority}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Audience: {a.target_audience}
                  </span>
                  {!a.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium">
                      Archived
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                  {currentUser?.role !== 'tenant' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(a.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        title={a.is_active ? 'Archive' : 'Activate'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(a)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        title="Edit bulletin"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(a)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        title="Delete bulletin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {a.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {a.message}
              </p>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Published by: {a.created_by_name}</span>
                <span className="font-mono text-[10px] text-slate-400">{a.id}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post / Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingAnnouncement ? 'Edit Announcement' : 'Post Center Announcement'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Water Maintenance Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Announcement['priority'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="General">General Notice</option>
                    <option value="Important">Important</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as Announcement['target_audience'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="All Tenants">All Tenants</option>
                    <option value="Specific Floor">Specific Floor</option>
                    <option value="Specific Property">Specific Property</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Message *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide detailed instructions or notice information..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  {editingAnnouncement ? 'Save Changes' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { X, Radio, AlertTriangle, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent?: () => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose, onSent }) => {
  const currentUser = auth.getCurrentUser();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetPropertyId, setTargetPropertyId] = useState<string>('all');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    db.addAnnouncement({
      organization_id: currentUser.organization_id,
      property_id: targetPropertyId === 'all' ? undefined : targetPropertyId,
      title,
      message,
      created_by: currentUser.name,
      is_active: true,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      if (onSent) onSent();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-red-600 text-white">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-sm">Emergency Center Broadcast</h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Broadcast Dispatched
            </h4>
            <p className="text-xs text-slate-500">
              Urgent announcement is now live across all center tenant feeds and dashboards.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBroadcast} className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                Dispatches immediately to tenant screens and on-call technician devices.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Shopping Center
              </label>
              <select
                value={targetPropertyId}
                onChange={(e) => setTargetPropertyId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="all">All Centers (Entire Portfolio)</option>
                {db.properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Broadcast Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Generator Testing Today 15:00 - 15:30"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Emergency / Advisory Notice *
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Details of water pressure fluctuations, electrical maintenance, or security drill instructions..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Emergency Broadcast</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

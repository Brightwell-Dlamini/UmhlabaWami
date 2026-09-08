import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { intelligence } from '../../services/intelligenceService';
import { auth } from '../../services/auth';
import { db } from '../../services/db';
import type { NotificationItem } from '../../types';

export const NotificationCentreView: React.FC<{ onOpenTicket?: (id: string) => void }> = ({
  onOpenTicket,
}) => {
  const user = auth.getCurrentUser();
  const [items, setItems] = useState<NotificationItem[]>([]);

  const refresh = () => {
    if (user) setItems(intelligence.getNotificationsForUser(user.id));
  };

  useEffect(() => {
    refresh();
    return db.subscribe(refresh);
  }, [user?.id]);

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Notification Centre
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tickets, SLA, approvals, and announcements — {unread} unread
          </p>
        </div>
        {user && (
          <button
            onClick={() => {
              intelligence.markAllRead(user.id);
              refresh();
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-slate-500 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            No notifications yet. System events will appear here as you operate the platform.
          </p>
        )}
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              intelligence.markNotificationRead(n.id);
              refresh();
              if (n.link_id && onOpenTicket) onOpenTicket(n.link_id);
            }}
            className={`w-full text-left p-4 rounded-2xl border transition ${
              n.read
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">{n.type.replace(/_/g, ' ')}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</div>
              </div>
              <div className="text-[10px] text-slate-400 whitespace-nowrap">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

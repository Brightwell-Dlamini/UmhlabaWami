import React, { useState, useEffect } from 'react';
import {
  Building2,
  Bell,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { auth } from '../../services/auth';
import { db } from '../../services/db';
import { EmergencyBroadcast } from '../../types';

interface NavbarProps {
  onOpenLogin?: () => void;
  onOpenRegisterOrg?: () => void;
  onOpenNotifications?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onOpenRegisterOrg,
  onOpenNotifications,
  isDarkMode = false,
  onToggleDarkMode,
  onLoginClick,
  onRegisterClick,
}) => {
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser());
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyBroadcast | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenLogin = () => {
    (onOpenLogin || onLoginClick)?.();
  };
  const handleOpenRegisterOrg = () => {
    (onOpenRegisterOrg || onRegisterClick)?.();
  };

  useEffect(() => {
    const unsubAuth = auth.subscribe(() => {
      setCurrentUser(auth.getCurrentUser());
    });
    const unsubDb = db.subscribe(() => {
      const u = auth.getCurrentUser();
      setUnreadCount(
        u
          ? db.notifications.filter((n) => (n.user_id === u.id || n.role === u.role) && !n.read).length
          : 0
      );
      setActiveEmergency(db.emergencyBroadcasts.find((b) => b.is_active) || null);
    });
    return () => {
      unsubAuth();
      unsubDb();
    };
  }, []);

  const handleLogout = () => {
    void auth.logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      {activeEmergency && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-center gap-2">
          <span>{activeEmergency.title || 'Active emergency notice'}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-12 items-center h-14 gap-1">
          <div className="col-span-3 sm:col-span-4 flex items-center justify-start gap-1 lg:gap-2">
            <button
              type="button"
              id="navbar-mobile-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <nav className="hidden md:flex items-center gap-1">
              <span className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300">
                Property Management
              </span>
            </nav>
          </div>

          <div className="col-span-6 sm:col-span-4 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Umhlaba Wami</div>
                <div className="text-[10px] text-slate-500 font-medium hidden xs:block">Property management</div>
              </div>
            </div>
          </div>

          <div className="col-span-3 sm:col-span-4 flex items-center justify-end gap-1.5 sm:gap-2">
            {currentUser && (
              <button
                type="button"
                onClick={() => onOpenNotifications?.()}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50 text-xs font-semibold">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {(currentUser.name || 'U')[0]}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="truncate max-w-[100px]">{(currentUser.name || 'User').split(' ')[0]}</div>
                    <div className="text-[10px] font-normal text-slate-500 capitalize">
                      {currentUser.role?.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
                <button type="button" onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 rounded-lg" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={handleOpenRegisterOrg}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1 bg-white dark:bg-slate-950">
          {!currentUser && (
            <>
              <button type="button" className="block w-full text-left text-sm py-2" onClick={handleOpenLogin}>Sign in</button>
              <button type="button" className="block w-full text-left text-sm py-2 font-semibold text-blue-600" onClick={handleOpenRegisterOrg}>Register organisation</button>
            </>
          )}
          {currentUser && (
            <button type="button" className="block w-full text-left text-sm py-2 text-red-600" onClick={handleLogout}>Sign out</button>
          )}
        </div>
      )}
    </header>
  );
};

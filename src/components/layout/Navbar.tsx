import React, { useState, useEffect } from 'react';
import {
  Building2,
  Bell,
  Shield,
  User,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  PlusCircle,
  AlertTriangle,
  Menu,
  X,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { auth } from '../../services/auth';
import { db } from '../../services/db';
import { UserRole, NotificationItem, EmergencyBroadcast } from '../../types';

interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  onOpenLogin?: () => void;
  onOpenRegisterOrg?: () => void;
  onOpenListLead?: () => void;
  onOpenNotifications?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  viewMode?: 'marketplace' | 'dashboard';
  onSwitchViewMode?: (mode: 'marketplace' | 'dashboard') => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenLogin,
  onOpenRegisterOrg,
  onOpenListLead,
  onOpenNotifications,
  isDarkMode = false,
  onToggleDarkMode,
  viewMode,
  onSwitchViewMode,
  onLoginClick,
  onRegisterClick,
}) => {
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser());
  const [currentOrg, setCurrentOrg] = useState(auth.getCurrentOrganization());
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyBroadcast | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const activeView = currentView || (viewMode === 'marketplace' ? 'marketplace' : 'app');

  const handleNavigate = (view: string) => {
    if (typeof onNavigate === 'function') {
      onNavigate(view);
    }
    if (typeof onSwitchViewMode === 'function') {
      if (view === 'marketplace' || view === 'how_it_works' || view === 'solutions') {
        onSwitchViewMode('marketplace');
      } else {
        onSwitchViewMode('dashboard');
      }
    }
  };

  const handleOpenLogin = () => {
    if (typeof onOpenLogin === 'function') onOpenLogin();
    else if (typeof onLoginClick === 'function') onLoginClick();
  };

  const handleOpenRegisterOrg = () => {
    if (typeof onOpenRegisterOrg === 'function') onOpenRegisterOrg();
    else if (typeof onRegisterClick === 'function') onRegisterClick();
  };

  const handleOpenListLead = () => {
    if (typeof onOpenListLead === 'function') onOpenListLead();
  };

  useEffect(() => {
    const unsubAuth = auth.subscribe(() => {
      setCurrentUser(auth.getCurrentUser());
      setCurrentOrg(auth.getCurrentOrganization());
    });
    const unsubDb = db.subscribe(() => {
      const u = auth.getCurrentUser();
      if (u) {
        const unread = db.notifications.filter((n) => (n.user_id === u.id || n.role === u.role) && !n.read).length;
        setUnreadCount(unread);
      } else {
        setUnreadCount(0);
      }
      const active = db.emergencyBroadcasts.find((e) => e.is_active);
      setActiveEmergency(active || null);
    });

    const u = auth.getCurrentUser();
    if (u) {
      const unread = db.notifications.filter((n) => (n.user_id === u.id || n.role === u.role) && !n.read).length;
      setUnreadCount(unread);
    }
    const active = db.emergencyBroadcasts.find((e) => e.is_active);
    setActiveEmergency(active || null);

    return () => {
      unsubAuth();
      unsubDb();
    };
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    auth.switchDemoUser(role);
    setShowRoleMenu(false);
    handleNavigate('app');
  };

  const handleLogout = () => {
    auth.logout();
    handleNavigate('marketplace');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Emergency Broadcast Alert Banner (ONLY shown on authenticated internal operations portal, NOT visitor interface) */}
      {activeView === 'app' && currentUser && activeEmergency && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-inner animate-pulse">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300" />
            <span>
              <strong className="uppercase tracking-wide">{activeEmergency.type} ALERT:</strong> {activeEmergency.headline} — {activeEmergency.instructions}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 items-center h-20 gap-2">
          {/* Left Column: Mobile Menu Toggle & Desktop Nav Links */}
          <div className="col-span-3 sm:col-span-4 flex items-center justify-start gap-1 lg:gap-2">
            {/* Mobile Menu Toggle */}
            <button
              id="navbar-mobile-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                id="nav-explore-spaces"
                onClick={() => handleNavigate('marketplace')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'marketplace'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                Explore Spaces
              </button>
              <button
                id="nav-how-it-works"
                onClick={() => handleNavigate('how_it_works')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'how_it_works'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                How It Works
              </button>
              <button
                id="nav-enterprise-features"
                onClick={() => handleNavigate('solutions')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'solutions'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                Enterprise
              </button>

              {currentUser && (
                <button
                  id="nav-operational-dashboard"
                  onClick={() => handleNavigate('app')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'app'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                  }`}
                >
                  Dashboard
                </button>
              )}
            </nav>
          </div>

          {/* Center Column: Logo & Brand in Middle */}
          <div className="col-span-6 sm:col-span-4 flex items-center justify-center">
            <div
              id="navbar-brand-logo"
              className="flex items-center gap-2.5 cursor-pointer group select-none text-center"
              onClick={() => handleNavigate('marketplace')}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white font-display">
                    Umhlaba <span className="text-blue-600 dark:text-blue-400">Wami</span>
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    SZ
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block tracking-tight font-medium">
                  Eswatini Commercial Property
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Actions, Switcher, Profile */}
          <div className="col-span-3 sm:col-span-4 flex items-center justify-end gap-1.5 sm:gap-2.5">
            {/* List Property Lead CTA */}
            <button
              id="navbar-list-property-cta"
              onClick={handleOpenListLead}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs"
              title="List your commercial shopping center or vacant units"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>List Property</span>
            </button>

            {/* Role Demo Quick Switcher */}
            <div className="relative">
              <button
                id="navbar-role-switcher-btn"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
                title="Switch role view for live demonstration"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden lg:inline text-slate-500">Role:</span>
                <span className="font-semibold text-blue-700 dark:text-blue-400 capitalize max-w-[85px] sm:max-w-none truncate">
                  {currentUser?.role ? currentUser.role.replace(/_/g, ' ') : 'Visitor'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Switch Role Demo View</p>
                    <p className="text-[11px] text-slate-500">Test Umhlaba Wami from each stakeholder's perspective</p>
                  </div>
                  <div className="py-1 space-y-1">
                    <button
                      onClick={() => handleRoleSelect('tenant')}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between ${
                        currentUser?.role === 'tenant' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium">1. Tenant Portal</div>
                        <div className="text-[10px] text-slate-500">Shop G-14 (Swazi Artisan Crafts)</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Live</span>
                    </button>

                    <button
                      onClick={() => handleRoleSelect('property_manager')}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between ${
                        currentUser?.role === 'property_manager' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium">2. Property Manager</div>
                        <div className="text-[10px] text-slate-500">Sipho Dlamini (The Gables Center)</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">SLA</span>
                    </button>

                    <button
                      onClick={() => handleRoleSelect('maintenance')}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between ${
                        currentUser?.role === 'maintenance' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium">3. Maintenance Team</div>
                        <div className="text-[10px] text-slate-500">Bheki Maseko (Senior Technician)</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded">Mobile</span>
                    </button>

                    <button
                      onClick={() => handleRoleSelect('finance')}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between ${
                        currentUser?.role === 'finance' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium">4. Finance Portal</div>
                        <div className="text-[10px] text-slate-500">Thandeka Nxumalo (Rent Roll & Sage)</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded">Ledger</span>
                    </button>

                    <button
                      onClick={() => handleRoleSelect('admin')}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between ${
                        currentUser?.role === 'admin' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium">5. Client Org Admin</div>
                        <div className="text-[10px] text-slate-500">Lindiwe Dlamini (Ezulwini Holdings)</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">Full</span>
                    </button>

                    <button
                      onClick={() => handleRoleSelect('super_admin')}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between ${
                        currentUser?.role === 'super_admin' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-red-600 dark:text-red-400">6. Super Admin (System)</div>
                        <div className="text-[10px] text-slate-500">Approvals, Subscriptions, Overrides</div>
                      </div>
                      <Shield className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {currentUser && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigate('app')}
                  className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition border border-blue-200/60 dark:border-blue-800/50 text-xs font-semibold"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {(currentUser.name || 'User')[0]}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="truncate max-w-[120px]">{(currentUser.name || 'User').split(' ')[0]}</div>
                    <div className="text-[10px] font-normal text-slate-500 capitalize">{currentUser.role ? currentUser.role.replace(/_/g, ' ') : 'User'}</div>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenLogin}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Sign In
                </button>
                <button
                  id="navbar-register-landlord-btn"
                  onClick={handleOpenRegisterOrg}
                  className="px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Register</span> Landlord
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 py-3 space-y-2">
            <button
              onClick={() => {
                handleNavigate('marketplace');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Explore Spaces
            </button>
            <button
              onClick={() => {
                handleNavigate('how_it_works');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                handleNavigate('solutions');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Commercial Features
            </button>
            <button
              onClick={() => {
                handleOpenListLead();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400"
            >
              + List Your Property (Landlord Lead)
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  handleNavigate('app');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg"
              >
                Go to Operational Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { TenantDashboard } from './components/dashboard/TenantDashboard';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { MaintenancePortal } from './components/dashboard/MaintenancePortal';
import { FinancePortal } from './components/dashboard/FinancePortal';
import { SuperAdminPortal } from './components/dashboard/SuperAdminPortal';
import { BroadcastModal } from './components/dashboard/BroadcastModal';
import { UnitsDirectoryView } from './components/management/UnitsDirectoryView';
import { LeaseManagementView } from './components/management/LeaseManagementView';
import { TicketsListView } from './components/dashboard/TicketsListView';
import { TenantsListView } from './components/dashboard/TenantsListView';
import { StaffScheduleView } from './components/dashboard/StaffScheduleView';
import { VendorsView } from './components/dashboard/VendorsView';
import { AnnouncementsView } from './components/dashboard/AnnouncementsView';
import { MessagesView } from './components/dashboard/MessagesView';
import { AnalyticsReportsView } from './components/dashboard/AnalyticsReportsView';
import { TenantDocumentsView } from './components/dashboard/TenantDocumentsView';
import { OrgUsersView } from './components/dashboard/OrgUsersView';
import { OrgSettingsView } from './components/dashboard/OrgSettingsView';
import { CreateTicketWizard } from './components/tickets/CreateTicketWizard';
import { TicketDetailModal } from './components/tickets/TicketDetailModal';
import { PropertyDetailModal } from './components/marketplace/PropertyDetailModal';
import { PropertyEnquiryModal } from './components/marketplace/PropertyEnquiryModal';
import { ListPropertyLeadModal } from './components/marketplace/ListPropertyLeadModal';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterOrgModal } from './components/auth/RegisterOrgModal';
import { auth } from './services/auth';
import { db } from './services/db';
import { Property, Shop, UserRole } from './types';
import { CheckCircle2, AlertCircle, Radio } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser());
  const [viewMode, setViewMode] = useState<'marketplace' | 'dashboard'>('marketplace');
  const [sidebarActiveTab, setSidebarActiveTab] = useState<string>('overview');

  // Modals state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOrgOpen, setIsRegisterOrgOpen] = useState(false);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Property / Shop modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [enquiryProperty, setEnquiryProperty] = useState<Property | null>(null);
  const [enquiryShop, setEnquiryShop] = useState<Shop | null>(null);

  // Other Modals
  const [isListLeadOpen, setIsListLeadOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubAuth = auth.subscribe((user) => {
      setCurrentUser(user ? { ...user } : null);
      if (user) {
        setViewMode('dashboard');
      } else {
        setViewMode('marketplace');
      }
    });

    const unsubDb = db.subscribe(() => {
      // triggers re-render when DB items change
      setCurrentUser(auth.getCurrentUser());
    });

    return () => {
      unsubAuth();
      unsubDb();
    };
  }, []);

  const getDefaultTabForRole = (role?: UserRole): string => {
    switch (role) {
      case 'tenant':
        return 'tenant_overview';
      case 'property_manager':
        return 'manager_overview';
      case 'maintenance':
        return 'maintenance_jobs';
      case 'finance':
        return 'finance_overview';
      case 'admin':
        return 'admin_overview';
      case 'super_admin':
        return 'super_overview';
      default:
        return 'overview';
    }
  };

  useEffect(() => {
    if (currentUser?.role) {
      setSidebarActiveTab(getDefaultTabForRole(currentUser.role));
    }
  }, [currentUser?.role, currentUser?.id]);

  // Check active emergency announcements
  const activeEmergency = db.announcements.find((a) => a.is_active && (a.title.toLowerCase().includes('emergency') || a.title.toLowerCase().includes('water') || a.title.toLowerCase().includes('generator')));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Emergency Center Alert Banner ONLY if logged in and inside operations dashboard */}
      {viewMode === 'dashboard' && currentUser && activeEmergency && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md z-40">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Radio className="w-4 h-4 animate-pulse shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[10px] bg-red-800 px-1.5 py-0.5 rounded">
              Center Alert
            </span>
            <span className="truncate">
              <strong>{activeEmergency.title}:</strong> {activeEmergency.message}
            </span>
          </div>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        currentView={viewMode}
        onNavigate={(view) => {
          if (view === 'marketplace' || view === 'how_it_works' || view === 'solutions') {
            setViewMode('marketplace');
            setTimeout(() => {
              if (view === 'how_it_works') {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              } else if (view === 'solutions') {
                document.getElementById('enterprise-features')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }, 50);
          } else {
            setViewMode('dashboard');
          }
        }}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegisterOrg={() => setIsRegisterOrgOpen(true)}
        onOpenListLead={() => setIsListLeadOpen(true)}
        onOpenNotifications={() => {}}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        viewMode={viewMode}
        onSwitchViewMode={(mode) => setViewMode(mode)}
        onLoginClick={() => setIsLoginOpen(true)}
        onRegisterClick={() => setIsRegisterOrgOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {viewMode === 'marketplace' ? (
          <main className="flex-1">
            <MarketplaceView
              onSelectProperty={(prop, shop) => {
                setSelectedProperty(prop);
                setSelectedShop(shop || null);
              }}
              onEnquire={(prop, shop) => {
                setEnquiryProperty(prop);
                setEnquiryShop(shop || null);
              }}
              onOpenListLead={() => setIsListLeadOpen(true)}
              onManageClick={() => setViewMode('dashboard')}
            />
          </main>
        ) : (
          /* Internal Operations Management Platform */
          <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 gap-6">
            {/* Sidebar Navigation */}
            <div className="hidden lg:block w-64 shrink-0">
              <Sidebar
                role={currentUser?.role || 'tenant'}
                activeTab={sidebarActiveTab}
                onTabChange={(tab) => {
                  if (tab === 'report_issue') {
                    setIsCreateTicketOpen(true);
                  } else {
                    setSidebarActiveTab(tab);
                  }
                }}
                onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
                organizationName={
                  currentUser?.organization_id
                    ? db.organizations.find((o) => o.id === currentUser.organization_id)?.company_name
                    : undefined
                }
                orgCode={
                  currentUser?.organization_id
                    ? db.organizations.find((o) => o.id === currentUser.organization_id)?.organization_code
                    : undefined
                }
              />
            </div>

            {/* Dashboard Content Panes */}
            <div className="flex-1 min-w-0">
              {(() => {
                // Properties / Units / Centers
                if (sidebarActiveTab === 'properties' || sidebarActiveTab === 'units') {
                  return (
                    <UnitsDirectoryView
                      onSelectShop={(shop) => {
                        const prop = db.properties.find((p) => p.id === shop.property_id) || db.properties[0];
                        setSelectedProperty(prop);
                        setSelectedShop(shop);
                      }}
                    />
                  );
                }

                // Leases & SLA Agreements
                if (sidebarActiveTab === 'leases' || sidebarActiveTab === 'tenant_lease') {
                  return <LeaseManagementView />;
                }

                // Tickets / SLAs / Incident Management
                if (
                  sidebarActiveTab === 'manager_tickets' ||
                  sidebarActiveTab === 'tenant_tickets' ||
                  sidebarActiveTab === 'maintenance_jobs' ||
                  sidebarActiveTab === 'maintenance_completed'
                ) {
                  return (
                    <TicketsListView
                      onViewTicket={(id) => setSelectedTicketId(id)}
                      onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
                      filterRole={sidebarActiveTab}
                    />
                  );
                }

                // Maintenance Operations Portal
                if (sidebarActiveTab === 'maintenance_ops') {
                  return (
                    <MaintenancePortal
                      onViewTicket={(id) => setSelectedTicketId(id)}
                    />
                  );
                }

                // Commercial Tenants Directory
                if (sidebarActiveTab === 'tenants_list') {
                  return (
                    <TenantsListView
                      onOpenCreateTicketForShop={(shopId) => {
                        setIsCreateTicketOpen(true);
                      }}
                      onViewLeases={() => setSidebarActiveTab('leases')}
                    />
                  );
                }

                // Staff Rostering & Schedules
                if (sidebarActiveTab === 'staff_schedule') {
                  return <StaffScheduleView />;
                }

                // Vendors & Contractors Management
                if (sidebarActiveTab === 'vendors') {
                  return <VendorsView />;
                }

                // Center Bulletins & Announcements
                if (sidebarActiveTab === 'announcements') {
                  return <AnnouncementsView />;
                }

                // Operations Communications Chat
                if (sidebarActiveTab === 'messages') {
                  return <MessagesView />;
                }

                // Analytics & SLA Reports
                if (sidebarActiveTab === 'analytics_reports') {
                  return <AnalyticsReportsView />;
                }

                // Tenant Documents Vault
                if (sidebarActiveTab === 'tenant_documents') {
                  return <TenantDocumentsView />;
                }

                // Staff & User Roles
                if (sidebarActiveTab === 'org_users' || sidebarActiveTab === 'super_users') {
                  return <OrgUsersView />;
                }

                // Organization Profile & Settings
                if (sidebarActiveTab === 'org_settings') {
                  return <OrgSettingsView />;
                }

                // Finance Portal & Specific Finance Sub-Tabs
                if (
                  sidebarActiveTab === 'finance' ||
                  sidebarActiveTab === 'finance_overview' ||
                  sidebarActiveTab === 'rent_roll' ||
                  sidebarActiveTab === 'expenses_ledger' ||
                  sidebarActiveTab === 'transactions' ||
                  sidebarActiveTab === 'financial_requests' ||
                  sidebarActiveTab === 'finance_documents'
                ) {
                  return <FinancePortal initialTab={sidebarActiveTab} />;
                }

                // Super Admin Portal & Specific Sub-Tabs
                if (
                  sidebarActiveTab === 'super_admin' ||
                  sidebarActiveTab === 'super_overview' ||
                  sidebarActiveTab === 'super_approvals' ||
                  sidebarActiveTab === 'super_organizations' ||
                  sidebarActiveTab === 'super_listings' ||
                  sidebarActiveTab === 'super_subscriptions' ||
                  sidebarActiveTab === 'audit_logs' ||
                  sidebarActiveTab === 'db_backup' ||
                  currentUser?.role === 'super_admin'
                ) {
                  return <SuperAdminPortal initialTab={sidebarActiveTab} />;
                }

                // Fallback to Role Default Dashboards for Overview tabs
                if (currentUser?.role === 'tenant') {
                  return (
                    <TenantDashboard
                      onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
                      onViewTicket={(id) => setSelectedTicketId(id)}
                    />
                  );
                }

                if (currentUser?.role === 'property_manager') {
                  return (
                    <ManagerDashboard
                      onViewTicket={(id) => setSelectedTicketId(id)}
                      onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
                      onOpenBroadcastModal={() => setIsBroadcastOpen(true)}
                    />
                  );
                }

                if (currentUser?.role === 'maintenance') {
                  return (
                    <MaintenancePortal
                      onViewTicket={(id) => setSelectedTicketId(id)}
                    />
                  );
                }

                if (currentUser?.role === 'finance') {
                  return <FinancePortal initialTab="rent_roll" />;
                }

                if (currentUser?.role === 'admin') {
                  return (
                    <ManagerDashboard
                      onViewTicket={(id) => setSelectedTicketId(id)}
                      onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
                      onOpenBroadcastModal={() => setIsBroadcastOpen(true)}
                    />
                  );
                }

                return (
                  <ManagerDashboard
                    onViewTicket={(id) => setSelectedTicketId(id)}
                    onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
                    onOpenBroadcastModal={() => setIsBroadcastOpen(true)}
                  />
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Footer (shown on marketplace & platform) */}
      <Footer />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom duration-200 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold">{toast.title}</div>
            <div className="text-[11px] text-slate-300">{toast.message}</div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* GLOBAL MODALS */}
      {/* ================================================================= */}

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onRegisterClick={() => {
          setIsLoginOpen(false);
          setIsRegisterOrgOpen(true);
        }}
      />

      <RegisterOrgModal
        isOpen={isRegisterOrgOpen}
        onClose={() => setIsRegisterOrgOpen(false)}
        onSuccess={() => {
          showToast('Registration Submitted', 'Your commercial landlord application has been submitted for Super Admin approval.');
        }}
      />

      {/* Property & Shop Modals */}
      <PropertyDetailModal
        property={selectedProperty}
        shop={selectedShop}
        onClose={() => {
          setSelectedProperty(null);
          setSelectedShop(null);
        }}
        onEnquire={(prop, shop) => {
          setSelectedProperty(null);
          setSelectedShop(null);
          setEnquiryProperty(prop);
          setEnquiryShop(shop || null);
        }}
      />

      <PropertyEnquiryModal
        property={enquiryProperty}
        shop={enquiryShop}
        isOpen={!!enquiryProperty}
        onClose={() => {
          setEnquiryProperty(null);
          setEnquiryShop(null);
        }}
        onSuccess={() => {
          showToast('Inquiry Submitted', 'The center property manager has received your commercial leasing application.');
        }}
      />

      <ListPropertyLeadModal
        isOpen={isListLeadOpen}
        onClose={() => setIsListLeadOpen(false)}
        onSuccess={() => {
          showToast('Commercial Listing Received', 'Our onboarding team will contact you within 24 hours.');
        }}
      />

      {/* Maintenance Ticket Modals */}
      <CreateTicketWizard
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        onSuccess={(ticketNumber) => {
          showToast('Ticket Dispatched!', `Ticket #${ticketNumber} created with active SLA countdown.`);
        }}
      />

      <TicketDetailModal
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onRefresh={() => {
          showToast('Ticket Updated', 'Maintenance status and audit trail saved successfully.');
        }}
      />

      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onSent={() => {
          showToast('Broadcast Sent', 'Emergency center alert is now active across all screens.');
        }}
      />
    </div>
  );
}

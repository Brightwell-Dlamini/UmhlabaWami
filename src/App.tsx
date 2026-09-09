import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
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
import { CentrePulseView } from './components/dashboard/CentrePulseView';
import { SlaConfigView } from './components/dashboard/SlaConfigView';
import { PreventiveMaintenanceView } from './components/dashboard/PreventiveMaintenanceView';
import { RentRollArrearsView } from './components/dashboard/RentRollArrearsView';
import { LeasingPipelineView } from './components/dashboard/LeasingPipelineView';
import { DepositLedgerView } from './components/dashboard/DepositLedgerView';
import { BoardPackView } from './components/dashboard/BoardPackView';
import { SubscriptionBillingView } from './components/dashboard/SubscriptionBillingView';
import { PortfolioIntelligenceView } from './components/dashboard/PortfolioIntelligenceView';
import { AiAssistView } from './components/dashboard/AiAssistView';
import { PermissionsView } from './components/dashboard/PermissionsView';
import { ComplianceAuditView } from './components/dashboard/ComplianceAuditView';
import { NotificationCentreView } from './components/dashboard/NotificationCentreView';
import { PartnerApiView } from './components/dashboard/PartnerApiView';
import { WhiteLabelView } from './components/dashboard/WhiteLabelView';
import { PlatformHealthView } from './components/dashboard/PlatformHealthView';
import { Phase7ElevateView } from './components/dashboard/Phase7ElevateView';
import { OfflineBanner } from './components/system/OfflineBanner';
import { CreateTicketWizard } from './components/tickets/CreateTicketWizard';
import { TicketDetailModal } from './components/tickets/TicketDetailModal';
import { PropertyDetailModal } from './components/marketplace/PropertyDetailModal';
import { PropertyEnquiryModal } from './components/marketplace/PropertyEnquiryModal';
import { ListPropertyLeadModal } from './components/marketplace/ListPropertyLeadModal';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterOrgModal } from './components/auth/RegisterOrgModal';
import { auth } from './services/auth';
import { db } from './services/db';
import { branding } from './services/brandingService';
import { Property, Shop, UserRole } from './types';
import { CheckCircle2, Radio } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser());
  const [viewMode, setViewMode] = useState<'marketplace' | 'dashboard'>('marketplace');
  const [sidebarActiveTab, setSidebarActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOrgOpen, setIsRegisterOrgOpen] = useState(false);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [enquiryProperty, setEnquiryProperty] = useState<Property | null>(null);
  const [enquiryShop, setEnquiryShop] = useState<Shop | null>(null);
  const [isListLeadOpen, setIsListLeadOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    // Prefer Supabase as source of truth when env keys are present
    void db.tryHydrateFromSupabase();
  }, []);

  useEffect(() => {
    const unsubAuth = auth.subscribe((user) => {
      setCurrentUser(user ? { ...user } : null);
      setViewMode(user ? 'dashboard' : 'marketplace');
    });
    const unsubDb = db.subscribe(() => setCurrentUser(auth.getCurrentUser()));
    return () => {
      unsubAuth();
      unsubDb();
    };
  }, []);

  const getDefaultTabForRole = (role?: UserRole): string => {
    switch (role) {
      case 'tenant': return 'tenant_overview';
      case 'property_manager': return 'centre_pulse';
      case 'maintenance': return 'maintenance_jobs';
      case 'finance': return 'rent_roll_arrears';
      case 'admin': return 'centre_pulse';
      case 'super_admin': return 'super_overview';
      default: return 'overview';
    }
  };

  useEffect(() => {
    if (currentUser?.role) setSidebarActiveTab(getDefaultTabForRole(currentUser.role));
  }, [currentUser?.role, currentUser?.id]);

  useEffect(() => {
    branding.applyForOrganization(currentUser?.organization_id);
  }, [currentUser?.organization_id]);

  const handleTabChange = (tab: string) => {
    if (tab === 'report_issue') setIsCreateTicketOpen(true);
    else setSidebarActiveTab(tab);
  };

  const activeEmergency = db.announcements.find(
    (a) =>
      a.is_active &&
      (a.title.toLowerCase().includes('emergency') ||
        a.title.toLowerCase().includes('water') ||
        a.title.toLowerCase().includes('generator'))
  );

  const renderDashboard = () => {
    if (sidebarActiveTab === 'centre_pulse')
      return <CentrePulseView onViewTicket={(id) => setSelectedTicketId(id)} onNavigate={handleTabChange} />;
    if (sidebarActiveTab === 'sla_config') return <SlaConfigView />;
    if (sidebarActiveTab === 'preventive') return <PreventiveMaintenanceView />;
    if (sidebarActiveTab === 'leasing_pipeline') return <LeasingPipelineView />;
    if (sidebarActiveTab === 'rent_roll_arrears') return <RentRollArrearsView />;
    if (sidebarActiveTab === 'deposits') return <DepositLedgerView />;
    if (sidebarActiveTab === 'board_pack') return <BoardPackView />;
    if (sidebarActiveTab === 'subscription_billing' || sidebarActiveTab === 'super_subscriptions')
      return <SubscriptionBillingView />;
    if (sidebarActiveTab === 'portfolio_intelligence')
      return <PortfolioIntelligenceView onViewTicket={(id) => setSelectedTicketId(id)} />;
    if (sidebarActiveTab === 'ai_assist')
      return <AiAssistView onViewTicket={(id) => setSelectedTicketId(id)} />;
    if (sidebarActiveTab === 'permissions') return <PermissionsView />;
    if (sidebarActiveTab === 'compliance_audit' || sidebarActiveTab === 'audit_logs')
      return <ComplianceAuditView />;
    if (sidebarActiveTab === 'notifications')
      return <NotificationCentreView onOpenTicket={(id) => setSelectedTicketId(id)} />;
    if (sidebarActiveTab === 'partner_api') return <PartnerApiView />;
    if (sidebarActiveTab === 'white_label') return <WhiteLabelView />;
    if (sidebarActiveTab === 'platform_health') return <PlatformHealthView />;
    if (sidebarActiveTab === 'phase7_elevate' || sidebarActiveTab === 'elevate')
      return <Phase7ElevateView onViewTicket={(id) => setSelectedTicketId(id)} />;
    if (sidebarActiveTab === 'properties' || sidebarActiveTab === 'units')
      return (
        <UnitsDirectoryView
          onSelectShop={(shop) => {
            const prop = db.properties.find((p) => p.id === shop.property_id) || db.properties[0];
            setSelectedProperty(prop);
            setSelectedShop(shop);
          }}
        />
      );
    if (sidebarActiveTab === 'leases' || sidebarActiveTab === 'tenant_lease') return <LeaseManagementView />;
    if (['manager_tickets', 'tenant_tickets', 'maintenance_jobs', 'maintenance_completed'].includes(sidebarActiveTab))
      return (
        <TicketsListView
          onViewTicket={(id) => setSelectedTicketId(id)}
          onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
          filterRole={sidebarActiveTab}
        />
      );
    if (sidebarActiveTab === 'maintenance_ops')
      return <MaintenancePortal onViewTicket={(id) => setSelectedTicketId(id)} />;
    if (sidebarActiveTab === 'tenants_list')
      return (
        <TenantsListView
          onOpenCreateTicketForShop={() => setIsCreateTicketOpen(true)}
          onViewLeases={() => setSidebarActiveTab('leases')}
        />
      );
    if (sidebarActiveTab === 'staff_schedule') return <StaffScheduleView />;
    if (sidebarActiveTab === 'vendors') return <VendorsView />;
    if (sidebarActiveTab === 'announcements') return <AnnouncementsView />;
    if (sidebarActiveTab === 'messages') return <MessagesView />;
    if (sidebarActiveTab === 'analytics_reports') return <AnalyticsReportsView />;
    if (sidebarActiveTab === 'tenant_documents') return <TenantDocumentsView />;
    if (sidebarActiveTab === 'org_users' || sidebarActiveTab === 'super_users') return <OrgUsersView />;
    if (sidebarActiveTab === 'org_settings') return <OrgSettingsView />;
    if (['finance', 'finance_overview', 'rent_roll', 'expenses_ledger', 'transactions', 'financial_requests', 'finance_documents'].includes(sidebarActiveTab))
      return <FinancePortal initialTab={sidebarActiveTab} />;
    if (['super_admin', 'super_overview', 'super_approvals', 'super_organizations', 'super_listings', 'db_backup'].includes(sidebarActiveTab) || currentUser?.role === 'super_admin')
      return <SuperAdminPortal initialTab={sidebarActiveTab} />;
    if (currentUser?.role === 'tenant')
      return <TenantDashboard onOpenCreateTicket={() => setIsCreateTicketOpen(true)} onViewTicket={(id) => setSelectedTicketId(id)} />;
    if (currentUser?.role === 'property_manager' || currentUser?.role === 'admin')
      return <CentrePulseView onViewTicket={(id) => setSelectedTicketId(id)} onNavigate={handleTabChange} />;
    if (currentUser?.role === 'maintenance')
      return <MaintenancePortal onViewTicket={(id) => setSelectedTicketId(id)} />;
    if (currentUser?.role === 'finance') return <RentRollArrearsView />;
    return (
      <ManagerDashboard
        onViewTicket={(id) => setSelectedTicketId(id)}
        onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
        onOpenBroadcastModal={() => setIsBroadcastOpen(true)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <OfflineBanner />
      {viewMode === 'dashboard' && currentUser && activeEmergency && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-semibold shadow-md z-40">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Radio className="w-4 h-4 animate-pulse shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[10px] bg-red-800 px-1.5 py-0.5 rounded">Center Alert</span>
            <span className="truncate"><strong>{activeEmergency.title}:</strong> {activeEmergency.message}</span>
          </div>
        </div>
      )}

      <Navbar
        currentView={viewMode}
        onNavigate={(view) => {
          if (view === 'marketplace' || view === 'how_it_works' || view === 'solutions') {
            setViewMode('marketplace');
            setTimeout(() => {
              if (view === 'how_it_works') document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              else if (view === 'solutions') document.getElementById('enterprise-features')?.scrollIntoView({ behavior: 'smooth' });
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
          } else setViewMode('dashboard');
        }}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegisterOrg={() => setIsRegisterOrgOpen(true)}
        onOpenListLead={() => setIsListLeadOpen(true)}
        onOpenNotifications={() => setSidebarActiveTab('notifications')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        viewMode={viewMode}
        onSwitchViewMode={(mode) => setViewMode(mode)}
        onLoginClick={() => setIsLoginOpen(true)}
        onRegisterClick={() => setIsRegisterOrgOpen(true)}
      />

      <div className="flex-1 flex flex-col">
        {viewMode === 'marketplace' ? (
          <main className="flex-1">
            <MarketplaceView
              onSelectProperty={(prop, shop) => { setSelectedProperty(prop); setSelectedShop(shop || null); }}
              onEnquire={(prop, shop) => { setEnquiryProperty(prop); setEnquiryShop(shop || null); }}
              onOpenListLead={() => setIsListLeadOpen(true)}
              onManageClick={() => setViewMode('dashboard')}
            />
          </main>
        ) : (
          <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 gap-6 pb-24 lg:pb-6">
            <div className="hidden lg:block w-64 shrink-0">
              <Sidebar
                role={currentUser?.role || 'tenant'}
                activeTab={sidebarActiveTab}
                onTabChange={handleTabChange}
                onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
                organizationName={currentUser?.organization_id ? db.organizations.find((o) => o.id === currentUser.organization_id)?.company_name : undefined}
                orgCode={currentUser?.organization_id ? db.organizations.find((o) => o.id === currentUser.organization_id)?.organization_code : undefined}
              />
            </div>
            <div className="flex-1 min-w-0">{renderDashboard()}</div>
          </div>
        )}
      </div>

      {viewMode === 'dashboard' && currentUser && (
        <MobileBottomNav role={currentUser.role} activeTab={sidebarActiveTab} onTabChange={handleTabChange} onOpenCreateTicket={() => setIsCreateTicketOpen(true)} />
      )}

      <Footer />

      {toast && (
        <div className="fixed bottom-24 lg:bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-3 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold">{toast.title}</div>
            <div className="text-[11px] text-slate-300">{toast.message}</div>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onRegisterClick={() => { setIsLoginOpen(false); setIsRegisterOrgOpen(true); }} onLoginSuccess={() => showToast('Welcome back', 'You are signed in to your operational dashboard.')} />
      <RegisterOrgModal isOpen={isRegisterOrgOpen} onClose={() => setIsRegisterOrgOpen(false)} onSuccess={() => showToast('Registration Submitted', 'Your commercial landlord application has been submitted for Super Admin approval.')} />
      <PropertyDetailModal property={selectedProperty} shop={selectedShop} onClose={() => { setSelectedProperty(null); setSelectedShop(null); }} onEnquire={(prop, shop) => { setSelectedProperty(null); setSelectedShop(null); setEnquiryProperty(prop); setEnquiryShop(shop || null); }} />
      <PropertyEnquiryModal property={enquiryProperty} shop={enquiryShop} isOpen={!!enquiryProperty} onClose={() => { setEnquiryProperty(null); setEnquiryShop(null); }} onSuccess={() => showToast('Inquiry Submitted', 'The center property manager has received your commercial leasing application.')} />
      <ListPropertyLeadModal isOpen={isListLeadOpen} onClose={() => setIsListLeadOpen(false)} onSuccess={() => showToast('Commercial Listing Received', 'Our onboarding team will contact you within 24 hours.')} />
      <CreateTicketWizard isOpen={isCreateTicketOpen} onClose={() => setIsCreateTicketOpen(false)} onSuccess={(ticketNumber) => showToast('Ticket Dispatched!', `Ticket #${ticketNumber} created with active SLA countdown.`)} />
      <TicketDetailModal ticketId={selectedTicketId} onClose={() => setSelectedTicketId(null)} onRefresh={() => showToast('Ticket Updated', 'Maintenance status and audit trail saved successfully.')} />
      <BroadcastModal isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} onSent={() => showToast('Broadcast Sent', 'Emergency center alert is now active across all screens.')} />
    </div>
  );
}

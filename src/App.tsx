import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer, type LegalPageId } from './components/layout/Footer';
import { LegalDocumentPage } from './components/legal/LegalDocumentPage';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { TenantDashboard } from './components/dashboard/TenantDashboard';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { MaintenancePortal } from './components/dashboard/MaintenancePortal';
import { FinancePortal } from './components/dashboard/FinancePortal';
import { SuperAdminPortal } from './components/dashboard/SuperAdminPortal';
import { BroadcastModal } from './components/dashboard/BroadcastModal';
import { UnitsDirectoryView } from './components/management/UnitsDirectoryView';
import { TicketsListView } from './components/dashboard/TicketsListView';
import { TenantsListView } from './components/dashboard/TenantsListView';
import { StaffScheduleView } from './components/dashboard/StaffScheduleView';
import { VendorsView } from './components/dashboard/VendorsView';
import { AnnouncementsView } from './components/dashboard/AnnouncementsView';
import { MessagesView } from './components/dashboard/MessagesView';
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
import { WhiteLabelView } from './components/dashboard/WhiteLabelView';
import { ComplianceAuditView } from './components/dashboard/ComplianceAuditView';
import { NotificationCentreView } from './components/dashboard/NotificationCentreView';
import { PlatformHealthView } from './components/dashboard/PlatformHealthView';
import { OfflineBanner } from './components/system/OfflineBanner';
import { CreateTicketWizard } from './components/tickets/CreateTicketWizard';
import { TicketDetailModal } from './components/tickets/TicketDetailModal';
import { PropertyDetailModal } from './components/marketplace/PropertyDetailModal';
import { PropertyEnquiryModal } from './components/marketplace/PropertyEnquiryModal';
import { ListPropertyLeadModal } from './components/marketplace/ListPropertyLeadModal';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterOrgModal } from './components/auth/RegisterOrgModal';
import { auth } from './services/auth';
import { Property, Shop, UserRole } from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser());
  const [viewMode, setViewMode] = useState<'marketplace' | 'dashboard'>(
    auth.getCurrentUser() ? 'dashboard' : 'marketplace'
  );
  const [sidebarActiveTab, setSidebarActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('umhlaba_dark') === '1';
    } catch {
      return false;
    }
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOrgOpen, setIsRegisterOrgOpen] = useState(false);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [enquiryProperty, setEnquiryProperty] = useState<Property | null>(null);
  const [enquiryShop, setEnquiryShop] = useState<Shop | null>(null);
  const [isListLeadOpen, setIsListLeadOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const [legalPage, setLegalPage] = useState<LegalPageId | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    return auth.subscribe(() => setCurrentUser(auth.getCurrentUser()));
  }, []);

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', isDarkMode);
      localStorage.setItem('umhlaba_dark', isDarkMode ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [isDarkMode]);

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLoginSuccess = () => {
    setCurrentUser(auth.getCurrentUser());
    setViewMode('dashboard');
    setIsLoginOpen(false);
  };

  const handleLogout = async () => {
    await auth.logout();
    setCurrentUser(null);
    setViewMode('marketplace');
    setSidebarActiveTab('overview');
  };

  const onTabChange = (tab: string) => {
    if (tab === 'report_issue') {
      setIsCreateTicketOpen(true);
      return;
    }
    setSidebarActiveTab(tab);
  };

  const renderDashboardBody = () => {
    if (!currentUser) return null;
    const role = currentUser.role as UserRole;
    const tab = sidebarActiveTab;

    if (role === 'super_admin') return <SuperAdminPortal initialTab={tab} />;
    if (tab === 'properties') return <UnitsDirectoryView />;
    if (tab === 'tenants_list')
      return <TenantsListView onOpenCreateTicketForShop={() => setIsCreateTicketOpen(true)} />;
    if (tab === 'org_users') return <OrgUsersView />;
    if (tab === 'announcements') return <AnnouncementsView />;
    if (tab === 'org_settings' || tab === 'white_label') return <OrgSettingsView />;
    if (tab === 'manager_tickets' || tab === 'tenant_tickets')
      return (
        <TicketsListView
          onOpenTicket={(id) => setSelectedTicketId(id)}
          onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
        />
      );
    if (tab === 'centre_pulse') return <CentrePulseView />;
    if (tab === 'rent_roll_arrears') return <RentRollArrearsView />;
    if (tab === 'deposits') return <DepositLedgerView />;
    if (tab === 'board_pack') return <BoardPackView />;
    if (tab === 'staff_schedule') return <StaffScheduleView />;
    if (tab === 'vendors') return <VendorsView />;
    if (tab === 'messages') return <MessagesView />;
    if (tab === 'notifications') return <NotificationCentreView />;
    if (tab === 'sla_config') return <SlaConfigView />;
    if (tab === 'preventive' || tab === 'maintenance_ops') return <PreventiveMaintenanceView />;
    if (tab === 'leasing_pipeline') return <LeasingPipelineView />;
    if (tab === 'compliance_audit') return <ComplianceAuditView />;
    if (tab === 'subscription_billing') return <SubscriptionBillingView />;
    if (tab === 'platform_health' || tab === 'db_backup') return <PlatformHealthView />;
    if (role === 'tenant')
      return <TenantDashboard onOpenCreateTicket={() => setIsCreateTicketOpen(true)} />;
    if (role === 'maintenance')
      return <MaintenancePortal onOpenTicket={(id) => setSelectedTicketId(id)} />;
    if (role === 'finance') return <FinancePortal />;
    return (
      <ManagerDashboard
        onViewTicket={(id) => setSelectedTicketId(id)}
        onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
      />
    );
  };

  if (viewMode === 'marketplace' || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenRegisterOrg={() => setIsRegisterOrgOpen(true)}
          onOpenListLead={() => setIsListLeadOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((d) => !d)}
          viewMode="marketplace"
          onSwitchViewMode={setViewMode}
        />
        <main className="flex-1">
          <MarketplaceView
            onSelectProperty={(p, s) => {
              setSelectedProperty(p);
              setSelectedShop(s || null);
            }}
            onEnquire={(p, s) => {
              setEnquiryProperty(p);
              setEnquiryShop(s || null);
            }}
          />
        </main>
        <Footer onOpenLegal={setLegalPage} />
        {legalPage && <LegalDocumentPage page={legalPage} onClose={() => setLegalPage(null)} />}
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
        <RegisterOrgModal isOpen={isRegisterOrgOpen} onClose={() => setIsRegisterOrgOpen(false)} />
        <ListPropertyLeadModal isOpen={isListLeadOpen} onClose={() => setIsListLeadOpen(false)} />
        <PropertyDetailModal
          property={selectedProperty}
          shop={selectedShop}
          onClose={() => {
            setSelectedProperty(null);
            setSelectedShop(null);
          }}
          onEnquire={() => {
            setEnquiryProperty(selectedProperty);
            setEnquiryShop(selectedShop);
            setSelectedProperty(null);
          }}
        />
        <PropertyEnquiryModal
          property={enquiryProperty}
          shop={enquiryShop}
          onClose={() => {
            setEnquiryProperty(null);
            setEnquiryShop(null);
          }}
        />
        {toast && (
          <div className="fixed bottom-4 right-4 z-[90] p-4 rounded-xl bg-slate-900 text-white shadow-xl max-w-sm">
            <div className="font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast.title}
            </div>
            <p className="text-xs text-slate-300 mt-1">{toast.message}</p>
          </div>
        )}
        <OfflineBanner />
      </div>
    );
  }

  const org = auth.getCurrentOrganization();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((d) => !d)}
        viewMode="dashboard"
        onSwitchViewMode={setViewMode}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          role={currentUser.role}
          activeTab={sidebarActiveTab}
          onTabChange={onTabChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          organizationName={org?.company_name}
          orgCode={org?.organization_code}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{renderDashboardBody()}</main>
      </div>
      <MobileBottomNav role={currentUser.role} activeTab={sidebarActiveTab} onTabChange={onTabChange} />
      <Footer onOpenLegal={setLegalPage} />
      {legalPage && <LegalDocumentPage page={legalPage} onClose={() => setLegalPage(null)} />}
      <CreateTicketWizard
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        onSuccess={(n) =>
          showToast('Ticket Dispatched!', `Ticket #${n} created with active SLA countdown.`)
        }
      />
      <TicketDetailModal ticketId={selectedTicketId} onClose={() => setSelectedTicketId(null)} />
      {toast && (
        <div className="fixed bottom-4 right-4 z-[90] p-4 rounded-xl bg-slate-900 text-white shadow-xl max-w-sm">
          <div className="font-bold text-sm">{toast.title}</div>
          <p className="text-xs text-slate-300 mt-1">{toast.message}</p>
        </div>
      )}
      <OfflineBanner />
    </div>
  );
}

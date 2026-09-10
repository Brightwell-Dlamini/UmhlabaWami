import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  MessageSquare,
  FileText,
  FileBadge,
  Building,
  Wrench,
  Users,
  Calendar,
  Truck,
  Megaphone,
  BarChart3,
  DollarSign,
  Receipt,
  ArrowDownUp,
  CreditCard,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Store,
  Layers,
  History,
  Activity,
  Shield,
  Kanban,
  Wallet,
  FileBarChart,
  Brain,
  Sparkles,
  Bell,
  Palette,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  role?: UserRole;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  organizationName?: string;
  orgCode?: string;
  onOpenCreateTicket?: () => void;
}

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badgeCount?: string | number;
  section?: string;
};

export const Sidebar: React.FC<SidebarProps> = ({
  role = 'tenant',
  activeTab,
  onTabChange,
  collapsed = false,
  onToggleCollapse,
  organizationName,
  orgCode,
}) => {
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'tenant':
        return [
          { id: 'tenant_overview', label: 'Dashboard', icon: LayoutDashboard, section: 'Home' },
          { id: 'tenant_tickets', label: 'My Tickets', icon: Ticket, section: 'Operations' },
          { id: 'report_issue', label: 'Report Issue', icon: PlusCircle, highlight: true, section: 'Operations' },
          { id: 'messages', label: 'Messages', icon: MessageSquare, section: 'Operations' },
          { id: 'tenant_documents', label: 'Documents', icon: FileText, section: 'Account' },
          { id: 'tenant_lease', label: 'Lease & SLA', icon: FileBadge, section: 'Account' },
          { id: 'announcements', label: 'Announcements', icon: Megaphone, section: 'Account' },
          { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Account' },
        ];

      // Property Manager = day-to-day centre operations
      case 'property_manager':
        return [
          { id: 'centre_pulse', label: 'Centre Pulse', icon: Activity, highlight: true, section: 'Home' },
          { id: 'manager_tickets', label: 'Tickets & SLAs', icon: Ticket, section: 'Operations' },
          { id: 'maintenance_ops', label: 'Maintenance Ops', icon: Wrench, section: 'Operations' },
          { id: 'preventive', label: 'Preventive PM', icon: Calendar, section: 'Operations' },
          { id: 'sla_config', label: 'SLA Matrix', icon: Shield, section: 'Operations' },
          { id: 'leasing_pipeline', label: 'Leasing Pipeline', icon: Kanban, section: 'Portfolio' },
          { id: 'properties', label: 'Properties & Centers', icon: Building, section: 'Portfolio' },
          { id: 'tenants_list', label: 'Tenants', icon: Users, section: 'Portfolio' },
          { id: 'staff_schedule', label: 'Roster & Shifts', icon: Calendar, section: 'Team' },
          { id: 'vendors', label: 'Vendors', icon: Truck, section: 'Team' },
          { id: 'announcements', label: 'Announcements', icon: Megaphone, section: 'Team' },
          { id: 'messages', label: 'Messages', icon: MessageSquare, section: 'Team' },
          { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Team' },
          { id: 'rent_roll_arrears', label: 'Rent Roll (view)', icon: DollarSign, section: 'Finance' },
          { id: 'board_pack', label: 'Board Pack', icon: FileBarChart, section: 'Finance' },
        ];

      case 'maintenance':
        return [
          { id: 'maintenance_jobs', label: 'My Jobs', icon: Wrench, section: 'Work' },
          { id: 'staff_schedule', label: 'My Schedule', icon: Calendar, section: 'Work' },
          { id: 'preventive', label: 'Preventive PM', icon: CheckCircle2, section: 'Work' },
          { id: 'messages', label: 'Operations Chat', icon: MessageSquare, section: 'Work' },
          { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Work' },
        ];

      case 'finance':
        return [
          { id: 'rent_roll_arrears', label: 'Rent Roll & Arrears', icon: DollarSign, highlight: true, section: 'Finance' },
          { id: 'deposits', label: 'Deposit Ledger', icon: Wallet, section: 'Finance' },
          { id: 'board_pack', label: 'Board Pack', icon: FileBarChart, section: 'Finance' },
          { id: 'expenses_ledger', label: 'Expenses Ledger', icon: Receipt, section: 'Finance' },
          { id: 'transactions', label: 'Transactions', icon: ArrowDownUp, section: 'Finance' },
          { id: 'financial_requests', label: 'Petty Cash & Requests', icon: CreditCard, section: 'Finance' },
          { id: 'finance_documents', label: 'Documents & Sage', icon: FileText, section: 'Finance' },
          { id: 'analytics_reports', label: 'Financial Reports', icon: BarChart3, section: 'Finance' },
          { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Insights' },
        ];

      // Client Admin = company executive (oversight, people, structure — not day-to-day ops)
      case 'admin':
        return [
          { id: 'centre_pulse', label: 'Portfolio Overview', icon: Activity, highlight: true, section: 'Home' },
          { id: 'portfolio_intelligence', label: 'Intelligence', icon: Brain, section: 'Home' },
          { id: 'properties', label: 'Properties & Units', icon: Building, section: 'Portfolio' },
          { id: 'tenants_list', label: 'Tenants Directory', icon: Users, section: 'Portfolio' },
          { id: 'org_users', label: 'Staff & Roles', icon: Users, section: 'Portfolio' },
          { id: 'manager_tickets', label: 'Ticket Escalations', icon: Ticket, section: 'Oversight' },
          { id: 'rent_roll_arrears', label: 'Rent Roll & Arrears', icon: DollarSign, section: 'Finance' },
          { id: 'deposits', label: 'Deposits', icon: Wallet, section: 'Finance' },
          { id: 'board_pack', label: 'Board Pack', icon: FileBarChart, section: 'Finance' },
          { id: 'announcements', label: 'Company Announcements', icon: Megaphone, section: 'Company' },
          { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Company' },
          { id: 'compliance_audit', label: 'Compliance Audit', icon: History, section: 'Settings' },
          { id: 'org_settings', label: 'Branding & Settings', icon: Settings, section: 'Settings' },
          { id: 'white_label', label: 'White-label', icon: Palette, section: 'Settings' },
        ];

      case 'super_admin':
        return [
          { id: 'super_overview', label: 'Platform Dashboard', icon: LayoutDashboard, highlight: true, section: 'Platform' },
          { id: 'super_approvals', label: 'Org Approvals', icon: ShieldCheck, badgeCount: 'Pending', section: 'Platform' },
          { id: 'super_organizations', label: 'All Organisations', icon: Layers, section: 'Platform' },
          { id: 'subscription_billing', label: 'Subscription Billing', icon: CreditCard, section: 'Platform' },
          { id: 'analytics_reports', label: 'Global Analytics', icon: BarChart3, section: 'Insights' },
          { id: 'super_users', label: 'User Directory', icon: Users, section: 'Insights' },
          { id: 'super_listings', label: 'Marketplace Vacancies', icon: Store, section: 'Marketplace' },
          { id: 'compliance_audit', label: 'Compliance Audit', icon: History, section: 'System' },
          { id: 'platform_health', label: 'Platform Health', icon: HeartPulse, section: 'System' },
          { id: 'db_backup', label: 'Database Backup', icon: Settings, section: 'System' },
        ];

      default:
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, section: 'Home' },
          { id: 'manager_tickets', label: 'Tickets', icon: Ticket, section: 'Home' },
        ];
    }
  };

  const navItems = getNavItems();
  const sections = Array.from(new Set(navItems.map((i) => i.section || 'Menu')));

  return (
    <aside
      className={`relative flex flex-col h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200 border-r border-white/5 shadow-xl transition-all duration-300 ease-in-out shrink-0 z-30 ${
        collapsed ? 'w-[4.5rem]' : 'w-64'
      }`}
    >
      <div className="px-3 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
            <Building className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-white tracking-wide truncate">
                {role === 'super_admin' ? 'Super Admin' : organizationName || 'Umhlaba Wami'}
              </div>
              {orgCode && role !== 'super_admin' ? (
                <div className="text-[10px] font-mono text-blue-300/80 truncate">{orgCode}</div>
              ) : (
                <div className="text-[10px] text-slate-500 capitalize">{String(role).replace(/_/g, ' ')}</div>
              )}
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition shrink-0"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-none">
        {sections.map((section) => (
          <div key={section}>
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
                {section}
              </div>
            )}
            <div className="space-y-0.5">
              {navItems
                .filter((i) => (i.section || 'Menu') === section)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onTabChange(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                          : item.highlight
                          ? 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/15'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-500'
                        }`}
                      />
                      {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                      {!collapsed && item.badgeCount && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                          {item.badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {!collapsed && (
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-slate-400">System online</span>
          </div>
        </div>
      )}
    </aside>
  );
};

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
  KeyRound,
  Bell,
  Code2,
  Palette,
  HeartPulse,
  Rocket,
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

export const Sidebar: React.FC<SidebarProps> = ({
  role = 'tenant',
  activeTab,
  onTabChange,
  collapsed = false,
  onToggleCollapse,
  organizationName,
  orgCode,
}) => {
  const getNavItems = () => {
    switch (role) {
      case 'tenant':
        return [
          { id: 'tenant_overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'tenant_tickets', label: 'My Tickets', icon: Ticket },
          { id: 'report_issue', label: 'Report Issue', icon: PlusCircle, highlight: true },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'tenant_documents', label: 'Documents', icon: FileText },
          { id: 'tenant_lease', label: 'Lease & SLA', icon: FileBadge },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];
      case 'property_manager':
        return [
          { id: 'centre_pulse', label: 'Centre Pulse', icon: Activity, highlight: true },
          { id: 'phase7_elevate', label: 'Elevate (P7)', icon: Rocket },
          { id: 'portfolio_intelligence', label: 'Intelligence', icon: Brain },
          { id: 'ai_assist', label: 'AI Assist', icon: Sparkles },
          { id: 'leasing_pipeline', label: 'Leasing Pipeline', icon: Kanban },
          { id: 'properties', label: 'Properties & Centers', icon: Building },
          { id: 'manager_tickets', label: 'Tickets & SLAs', icon: Ticket },
          { id: 'maintenance_ops', label: 'Maintenance Ops', icon: Wrench },
          { id: 'preventive', label: 'Preventive PM', icon: Calendar },
          { id: 'sla_config', label: 'SLA Matrix', icon: Shield },
          { id: 'tenants_list', label: 'Tenants', icon: Users },
          { id: 'rent_roll_arrears', label: 'Rent Roll & Arrears', icon: DollarSign },
          { id: 'board_pack', label: 'Board Pack', icon: FileBarChart },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'staff_schedule', label: 'Roster & Shifts', icon: Calendar },
          { id: 'vendors', label: 'Vendors', icon: Truck },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
        ];
      case 'maintenance':
        return [
          { id: 'maintenance_jobs', label: 'My Jobs', icon: Wrench },
          { id: 'phase7_elevate', label: 'Elevate (P7)', icon: Rocket },
          { id: 'staff_schedule', label: 'My Schedule', icon: Calendar },
          { id: 'preventive', label: 'Preventive PM', icon: CheckCircle2 },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'messages', label: 'Operations Chat', icon: MessageSquare },
        ];
      case 'finance':
        return [
          { id: 'rent_roll_arrears', label: 'Rent Roll & Arrears', icon: DollarSign, highlight: true },
          { id: 'phase7_elevate', label: 'Elevate (P7)', icon: Rocket },
          { id: 'deposits', label: 'Deposit Ledger', icon: Wallet },
          { id: 'board_pack', label: 'Board Pack', icon: FileBarChart },
          { id: 'portfolio_intelligence', label: 'Intelligence', icon: Brain },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'expenses_ledger', label: 'Expenses Ledger', icon: Receipt },
          { id: 'transactions', label: 'Transactions', icon: ArrowDownUp },
          { id: 'financial_requests', label: 'Petty Cash & Requests', icon: CreditCard },
          { id: 'finance_documents', label: 'Documents & Sage', icon: FileText },
          { id: 'analytics_reports', label: 'Financial Reports', icon: BarChart3 },
        ];
      case 'admin':
        return [
          { id: 'centre_pulse', label: 'Centre Pulse', icon: Activity, highlight: true },
          { id: 'phase7_elevate', label: 'Elevate (P7)', icon: Rocket, highlight: true },
          { id: 'portfolio_intelligence', label: 'Intelligence', icon: Brain },
          { id: 'ai_assist', label: 'AI Assist', icon: Sparkles },
          { id: 'permissions', label: 'Permissions', icon: KeyRound },
          { id: 'compliance_audit', label: 'Compliance Audit', icon: History },
          { id: 'leasing_pipeline', label: 'Leasing Pipeline', icon: Kanban },
          { id: 'properties', label: 'Properties & Units', icon: Building },
          { id: 'tenants_list', label: 'Tenants Directory', icon: Users },
          { id: 'org_users', label: 'Staff & Roles', icon: Users },
          { id: 'manager_tickets', label: 'All Tickets', icon: Ticket },
          { id: 'rent_roll_arrears', label: 'Rent Roll & Arrears', icon: DollarSign },
          { id: 'deposits', label: 'Deposits', icon: Wallet },
          { id: 'board_pack', label: 'Board Pack', icon: FileBarChart },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'white_label', label: 'White-label', icon: Palette },
          { id: 'partner_api', label: 'Partner API', icon: Code2 },
          { id: 'platform_health', label: 'Platform Health', icon: HeartPulse },
          { id: 'preventive', label: 'Preventive PM', icon: Calendar },
          { id: 'sla_config', label: 'SLA Matrix', icon: Shield },
          { id: 'staff_schedule', label: 'Staff Rostering', icon: Calendar },
          { id: 'vendors', label: 'Vendors', icon: Truck },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'org_settings', label: 'Branding & Settings', icon: Settings },
        ];
      case 'super_admin':
        return [
          { id: 'super_overview', label: 'Platform Dashboard', icon: LayoutDashboard },
          { id: 'phase7_elevate', label: 'Elevate (P7)', icon: Rocket, highlight: true },
          { id: 'super_approvals', label: 'Org Approvals', icon: ShieldCheck, badgeCount: 'Pending' },
          { id: 'super_organizations', label: 'All Organizations', icon: Layers },
          { id: 'subscription_billing', label: 'Subscription Billing', icon: CreditCard },
          { id: 'portfolio_intelligence', label: 'Intelligence', icon: Brain },
          { id: 'permissions', label: 'Permissions', icon: KeyRound },
          { id: 'compliance_audit', label: 'Compliance Audit', icon: History },
          { id: 'partner_api', label: 'Partner API', icon: Code2 },
          { id: 'platform_health', label: 'Platform Health', icon: HeartPulse },
          { id: 'super_listings', label: 'Marketplace Vacancies', icon: Store },
          { id: 'super_users', label: 'User Directory', icon: Users },
          { id: 'analytics_reports', label: 'Global Analytics', icon: BarChart3 },
          { id: 'db_backup', label: 'Database Backup', icon: Settings },
        ];
      default:
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'manager_tickets', label: 'Tickets', icon: Ticket },
        ];
    }
  };

  const navItems = getNavItems() || [];

  return (
    <aside
      className={`relative flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0 z-30 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div className="min-w-0 pr-2">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
              {role === 'super_admin' ? 'Super Admin Console' : organizationName || 'Umhlaba Wami'}
            </h2>
            {orgCode && role !== 'super_admin' && (
              <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 truncate">Code: {orgCode}</p>
            )}
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition mx-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                  : item.highlight
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive
                    ? 'text-white'
                    : item.highlight
                    ? 'text-blue-600'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badgeCount && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!collapsed && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-600 dark:text-slate-300 capitalize">
              {String(role || 'tenant').replace(/_/g, ' ')}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">Phase 7 · Elevate</p>
        </div>
      )}
    </aside>
  );
};

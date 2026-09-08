import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Building,
  Users,
  Wrench,
  DollarSign,
  Settings,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { UserRole } from '../../types';

interface MobileBottomNavProps {
  role?: UserRole;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onOpenCreateTicket?: () => void;
}

/** Compact bottom navigation for dashboard mode on small screens (Phase 1 responsive requirement). */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  role = 'tenant',
  activeTab,
  onTabChange,
  onOpenCreateTicket,
}) => {
  const items = (() => {
    switch (role) {
      case 'tenant':
        return [
          { id: 'tenant_overview', label: 'Home', icon: LayoutDashboard },
          { id: 'tenant_tickets', label: 'Tickets', icon: Ticket },
          { id: 'report_issue', label: 'Report', icon: PlusCircle, primary: true },
          { id: 'messages', label: 'Chat', icon: MessageSquare },
          { id: 'tenant_lease', label: 'Lease', icon: Building },
        ];
      case 'maintenance':
        return [
          { id: 'maintenance_jobs', label: 'Jobs', icon: Wrench },
          { id: 'maintenance_completed', label: 'Done', icon: Ticket },
          { id: 'staff_schedule', label: 'Roster', icon: Users },
          { id: 'messages', label: 'Chat', icon: MessageSquare },
        ];
      case 'finance':
        return [
          { id: 'finance_overview', label: 'Home', icon: LayoutDashboard },
          { id: 'rent_roll', label: 'Rent', icon: DollarSign },
          { id: 'transactions', label: 'Txns', icon: Ticket },
          { id: 'financial_requests', label: 'Requests', icon: Users },
        ];
      case 'super_admin':
        return [
          { id: 'super_overview', label: 'Home', icon: LayoutDashboard },
          { id: 'super_approvals', label: 'Approve', icon: ShieldCheck },
          { id: 'super_organizations', label: 'Orgs', icon: Building },
          { id: 'audit_logs', label: 'Audit', icon: Settings },
        ];
      case 'admin':
      case 'property_manager':
      default:
        return [
          { id: role === 'admin' ? 'admin_overview' : 'manager_overview', label: 'Home', icon: LayoutDashboard },
          { id: 'manager_tickets', label: 'Tickets', icon: Ticket },
          { id: 'report_issue', label: 'New', icon: PlusCircle, primary: true },
          { id: 'tenants_list', label: 'Tenants', icon: Users },
          { id: 'properties', label: 'Units', icon: Building },
        ];
    }
  })();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="flex items-stretch justify-around px-1 pt-1.5 pb-2 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isPrimary = 'primary' in item && item.primary;

          if (isPrimary) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'report_issue' && onOpenCreateTicket) {
                    onOpenCreateTicket();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className="flex flex-col items-center justify-center -mt-3 px-3"
              >
                <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-1">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-0.5 truncate max-w-full px-0.5 ${
                isActive ? 'font-bold' : 'font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

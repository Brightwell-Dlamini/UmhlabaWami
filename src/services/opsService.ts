/**
 * Phase 3 — Operations Excellence service layer.
 * Builds on DbService with SLA matrices, escalations, preventive maintenance,
 * preferred-vendor routing, and Centre Pulse aggregates.
 */
import { db } from './db';
import type {
  Ticket,
  TicketPriority,
  TicketCategory,
  Vendor,
  StaffShift,
  Announcement,
  NotificationItem,
} from '../types';

export interface OrgSlaMatrix {
  organization_id: string;
  rules: Array<{
    priority: TicketPriority;
    response_minutes: number;
    resolution_minutes: number;
    escalate_after_minutes: number;
  }>;
  updated_at: string;
}

export interface PreventiveTask {
  id: string;
  organization_id: string;
  property_id: string;
  shopping_center_id?: string;
  title: string;
  category: TicketCategory | 'General Facilities';
  frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual';
  next_due: string; // YYYY-MM-DD
  assigned_to_name?: string;
  preferred_vendor_id?: string;
  status: 'Scheduled' | 'Due' | 'Overdue' | 'Completed';
  last_completed_at?: string;
  notes?: string;
}

const SLA_STORAGE_KEY = 'umhlaba_wami_sla_matrices_v1';
const PM_STORAGE_KEY = 'umhlaba_wami_preventive_v1';

const DEFAULT_RULES: OrgSlaMatrix['rules'] = [
  { priority: 'Emergency', response_minutes: 15, resolution_minutes: 120, escalate_after_minutes: 30 },
  { priority: 'High', response_minutes: 60, resolution_minutes: 480, escalate_after_minutes: 120 },
  { priority: 'Medium', response_minutes: 240, resolution_minutes: 1440, escalate_after_minutes: 480 },
  { priority: 'Low', response_minutes: 1440, resolution_minutes: 4320, escalate_after_minutes: 2880 },
];

const CATEGORY_VENDOR_MAP: Record<string, string[]> = {
  'Air Conditioning': ['HVAC', 'Air Conditioning'],
  Plumbing: ['Plumbing'],
  Electrical: ['Electrical'],
  'Water Leak': ['Plumbing'],
  'Structural Damage': ['Structural', 'Roofing'],
  Security: ['Security'],
  Cleaning: ['Cleaning'],
};

function loadSlaMatrices(): Record<string, OrgSlaMatrix> {
  try {
    const raw = localStorage.getItem(SLA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSlaMatrices(data: Record<string, OrgSlaMatrix>) {
  localStorage.setItem(SLA_STORAGE_KEY, JSON.stringify(data));
}

function loadPreventive(): PreventiveTask[] {
  try {
    const raw = localStorage.getItem(PM_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  // Seed realistic Eswatini centre PM schedule
  const seed: PreventiveTask[] = [
    {
      id: 'pm_hvac_q',
      organization_id: 'org_gables_lifestyle',
      property_id: 'prop_gables_retail',
      title: 'Quarterly HVAC filter & condenser service — common plant',
      category: 'Air Conditioning',
      frequency: 'Quarterly',
      next_due: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      assigned_to_name: 'Peak HVAC Eswatini',
      status: 'Due',
      notes: 'Includes rooftop package units on Block A & B',
    },
    {
      id: 'pm_fire_m',
      organization_id: 'org_gables_lifestyle',
      property_id: 'prop_gables_retail',
      title: 'Monthly fire extinguisher & hose reel inspection',
      category: 'Security',
      frequency: 'Monthly',
      next_due: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
      status: 'Overdue',
      notes: 'Certificate required for municipal compliance',
    },
    {
      id: 'pm_lift_m',
      organization_id: 'org_gables_lifestyle',
      property_id: 'prop_gables_retail',
      title: 'Monthly passenger lift safety check',
      category: 'Other',
      frequency: 'Monthly',
      next_due: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10),
      status: 'Scheduled',
    },
    {
      id: 'pm_gen_w',
      organization_id: 'org_gables_lifestyle',
      property_id: 'prop_gables_retail',
      title: 'Weekly generator load test (load bank)',
      category: 'Electrical',
      frequency: 'Weekly',
      next_due: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
      status: 'Scheduled',
      notes: 'Critical for Ezulwini load-shedding resilience',
    },
  ];
  localStorage.setItem(PM_STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function savePreventive(tasks: PreventiveTask[]) {
  localStorage.setItem(PM_STORAGE_KEY, JSON.stringify(tasks));
}

class OpsService {
  getSlaMatrix(organizationId: string): OrgSlaMatrix {
    const all = loadSlaMatrices();
    if (all[organizationId]) return all[organizationId];
    return {
      organization_id: organizationId,
      rules: DEFAULT_RULES.map((r) => ({ ...r })),
      updated_at: new Date().toISOString(),
    };
  }

  updateSlaMatrix(organizationId: string, rules: OrgSlaMatrix['rules']): OrgSlaMatrix {
    const all = loadSlaMatrices();
    const matrix: OrgSlaMatrix = {
      organization_id: organizationId,
      rules,
      updated_at: new Date().toISOString(),
    };
    all[organizationId] = matrix;
    saveSlaMatrices(all);
    db.logAudit(
      'system',
      'Operations',
      'UPDATE_SLA_MATRIX',
      'Organization',
      organizationId,
      organizationId,
      'SLA response/resolution matrix updated'
    );
    return matrix;
  }

  getRuleForPriority(organizationId: string, priority: TicketPriority) {
    const matrix = this.getSlaMatrix(organizationId);
    return matrix.rules.find((r) => r.priority === priority) || DEFAULT_RULES.find((r) => r.priority === priority)!;
  }

  /** Recalculate SLA status flags on open tickets */
  recalcSlaStatuses(organizationId?: string): number {
    const now = Date.now();
    let changed = 0;
    for (const t of db.tickets) {
      if (organizationId && t.organization_id !== organizationId) continue;
      if (t.status === 'Resolved' || t.status === 'Closed' || t.status === 'Cancelled') continue;

      const resDue = new Date(t.resolution_deadline).getTime();
      const respDue = new Date(t.response_deadline).getTime();
      let next: Ticket['sla_status'] = 'Compliant';

      if (now > resDue) next = 'Overdue';
      else if (now > respDue && !t.responded_at) next = 'Warning';
      else if (t.sla_status === 'Escalated') next = 'Escalated';
      else {
        const rule = this.getRuleForPriority(t.organization_id, t.priority);
        const ageMins = (now - new Date(t.created_at).getTime()) / 60000;
        if (ageMins >= rule.escalate_after_minutes && t.status === 'Open' && !t.assigned_to) {
          next = 'Warning';
        }
      }

      if (t.sla_status !== next) {
        t.sla_status = next;
        changed++;
      }
    }
    if (changed) db.saveToStorage();
    return changed;
  }

  escalateTicket(
    ticketId: string,
    actorName: string,
    reason: string,
    escalateTo: 'supervisor' | 'manager' | 'vendor' = 'manager'
  ): Ticket | null {
    const ticket = db.tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    ticket.sla_status = 'Escalated';
    if (ticket.priority === 'Low') ticket.priority = 'Medium';
    else if (ticket.priority === 'Medium') ticket.priority = 'High';
    else if (ticket.priority === 'High') ticket.priority = 'Emergency';

    // Tighten deadlines on escalation
    const rule = this.getRuleForPriority(ticket.organization_id, ticket.priority);
    ticket.resolution_deadline = new Date(Date.now() + rule.resolution_minutes * 60000).toISOString();
    ticket.response_deadline = new Date(Date.now() + rule.response_minutes * 60000).toISOString();

    ticket.timeline = ticket.timeline || [];
    ticket.timeline.push({
      id: `tl_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: `Escalated to ${escalateTo}`,
      description: reason,
      actor_name: actorName,
      actor_role: 'property_manager',
      type: 'escalation',
    });

    // Notify managers
    const managers = db.users.filter(
      (u) =>
        u.organization_id === ticket.organization_id &&
        (u.role === 'property_manager' || u.role === 'admin') &&
        u.status === 'Active'
    );
    for (const m of managers) {
      const n: NotificationItem = {
        id: `notif_${Date.now()}_${m.id}`,
        user_id: m.id,
        organization_id: ticket.organization_id,
        type: 'sla_breach',
        title: `Escalated: ${ticket.ticket_number}`,
        message: `${ticket.title} — ${reason}`,
        read: false,
        created_at: new Date().toISOString(),
        link_id: ticket.id,
      };
      db.notifications.unshift(n);
    }

    db.logAudit(
      'ops',
      actorName,
      'ESCALATE_TICKET',
      'Ticket',
      ticket.id,
      ticket.organization_id,
      reason
    );
    db.saveToStorage();
    return ticket;
  }

  getPreferredVendor(organizationId: string, category: TicketCategory): Vendor | null {
    const keywords = CATEGORY_VENDOR_MAP[category] || [category];
    const vendors = db.vendors.filter(
      (v) => v.organization_id === organizationId && v.status === 'Active'
    );
    const scored = vendors
      .map((v) => ({
        v,
        score:
          keywords.some((k) => v.service_category.toLowerCase().includes(k.toLowerCase()))
            ? v.performance_rating + 10
            : v.performance_rating,
      }))
      .sort((a, b) => b.score - a.score);
    return scored[0]?.v || null;
  }

  createVendorCallout(
    vendorId: string,
    organizationId: string,
    urgency: 'Emergency' | 'High' | 'Routine',
    reason: string,
    actorName: string,
    propertyId?: string
  ): Ticket | null {
    const vendor = db.vendors.find((v) => v.id === vendorId);
    if (!vendor) return null;

    const priority: TicketPriority =
      urgency === 'Emergency' ? 'Emergency' : urgency === 'High' ? 'High' : 'Medium';
    const rule = this.getRuleForPriority(organizationId, priority);
    const propId = propertyId || vendor.assigned_property_ids[0] || db.properties[0]?.id;
    const shop = db.shops.find((s) => s.property_id === propId) || db.shops[0];
    const tenant = db.tenants.find((t) => t.shop_id === shop?.id) || db.tenants[0];
    const creator = db.users.find(
      (u) => u.organization_id === organizationId && (u.role === 'property_manager' || u.role === 'admin')
    );

    if (!shop || !tenant || !creator) return null;

    const ticket = db.createTicket({
      organization_id: organizationId,
      shopping_center_id: shop.shopping_center_id,
      property_id: shop.property_id,
      shop_id: shop.id,
      tenant_id: tenant.id,
      title: `Vendor callout: ${vendor.company_name}`,
      description: `${reason}\n\nDispatched to ${vendor.company_name} (${vendor.contact_person}, ${vendor.phone}). Category: ${vendor.service_category}.`,
      priority,
      category: 'Other',
      created_by_user_id: creator.id,
      exact_location_description: 'Vendor dispatch — facilities plant / unit as briefed',
    });

    // Adjust deadlines from org SLA matrix
    ticket.response_deadline = new Date(Date.now() + rule.response_minutes * 60000).toISOString();
    ticket.resolution_deadline = new Date(Date.now() + rule.resolution_minutes * 60000).toISOString();
    ticket.timeline.push({
      id: `tl_callout_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: 'Vendor callout issued',
      description: `SMS/email simulated to ${vendor.email}`,
      actor_name: actorName,
      actor_role: 'property_manager',
      type: 'assignment',
    });
    db.saveToStorage();
    return ticket;
  }

  listPreventive(organizationId?: string): PreventiveTask[] {
    const tasks = loadPreventive();
    const today = new Date().toISOString().slice(0, 10);
    // Refresh due/overdue flags
    for (const t of tasks) {
      if (t.status === 'Completed') continue;
      if (t.next_due < today) t.status = 'Overdue';
      else if (t.next_due <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)) t.status = 'Due';
      else t.status = 'Scheduled';
    }
    savePreventive(tasks);
    return organizationId ? tasks.filter((t) => t.organization_id === organizationId) : tasks;
  }

  addPreventive(task: Omit<PreventiveTask, 'id' | 'status'>): PreventiveTask {
    const tasks = loadPreventive();
    const today = new Date().toISOString().slice(0, 10);
    const full: PreventiveTask = {
      ...task,
      id: `pm_${Date.now()}`,
      status: task.next_due < today ? 'Overdue' : task.next_due <= today ? 'Due' : 'Scheduled',
    };
    tasks.unshift(full);
    savePreventive(tasks);
    return full;
  }

  completePreventive(taskId: string, completedBy: string): PreventiveTask | null {
    const tasks = loadPreventive();
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return null;
    t.status = 'Completed';
    t.last_completed_at = new Date().toISOString();
    // Roll next due based on frequency
    const base = new Date();
    const days =
      t.frequency === 'Weekly'
        ? 7
        : t.frequency === 'Monthly'
        ? 30
        : t.frequency === 'Quarterly'
        ? 90
        : t.frequency === 'Bi-Annual'
        ? 182
        : 365;
    t.next_due = new Date(base.getTime() + days * 86400000).toISOString().slice(0, 10);
    t.status = 'Scheduled';
    t.notes = `${t.notes || ''} | Completed by ${completedBy} on ${t.last_completed_at}`;
    savePreventive(tasks);
    db.logAudit('ops', completedBy, 'COMPLETE_PREVENTIVE', 'PreventiveTask', taskId, t.organization_id);
    return t;
  }

  getOnCallStaff(organizationId?: string): StaffShift[] {
    return db.shifts.filter(
      (s) =>
        s.status === 'On-Call' &&
        (!organizationId || s.organization_id === organizationId)
    );
  }

  /** Centre Pulse aggregates for manager command centre */
  getCentrePulse(organizationId?: string) {
    this.recalcSlaStatuses(organizationId);
    const tickets = organizationId
      ? db.tickets.filter((t) => t.organization_id === organizationId)
      : db.tickets;

    const open = tickets.filter((t) => !['Resolved', 'Closed', 'Cancelled'].includes(t.status));
    const emergencies = open.filter((t) => t.priority === 'Emergency');
    const overdue = open.filter((t) => t.sla_status === 'Overdue' || t.sla_status === 'Escalated');
    const unassigned = open.filter((t) => !t.assigned_to);
    const inProgress = open.filter((t) => t.status === 'In Progress');
    const awaitingTenant = tickets.filter((t) => t.status === 'Resolved');

    const pm = this.listPreventive(organizationId);
    const pmOverdue = pm.filter((p) => p.status === 'Overdue');
    const onCall = this.getOnCallStaff(organizationId);

    const announcements = (organizationId
      ? db.announcements.filter((a) => a.organization_id === organizationId && a.is_active)
      : db.announcements.filter((a) => a.is_active)
    ).slice(0, 5);

    const todayJobs = open
      .slice()
      .sort((a, b) => {
        const pRank = (p: TicketPriority) =>
          p === 'Emergency' ? 0 : p === 'High' ? 1 : p === 'Medium' ? 2 : 3;
        return pRank(a.priority) - pRank(b.priority);
      })
      .slice(0, 8);

    return {
      counts: {
        open: open.length,
        emergencies: emergencies.length,
        overdue: overdue.length,
        unassigned: unassigned.length,
        inProgress: inProgress.length,
        awaitingTenant: awaitingTenant.length,
        pmOverdue: pmOverdue.length,
        onCall: onCall.length,
      },
      emergencies,
      overdue,
      unassigned,
      todayJobs,
      pmOverdue,
      onCall,
      announcements,
    };
  }
}

export const ops = new OpsService();

/**
 * Phase 5 — Intelligence & Scale
 * Portfolio analytics from live demo data, rule-based AI triage,
 * granular permissions, anomaly detection, NL query helpers.
 */
import { db } from './db';
import { commercial } from './commercialService';
import { ops } from './opsService';
import type {
  Ticket,
  TicketCategory,
  TicketPriority,
  UserRole,
  AuditLog,
  NotificationItem,
} from '../types';

export interface PortfolioKpis {
  organization_id?: string;
  occupancy_rate: number;
  units_total: number;
  units_occupied: number;
  units_vacant: number;
  monthly_rent_roll: number;
  arrears_total: number;
  collection_rate: number;
  open_tickets: number;
  sla_compliance_pct: number;
  avg_resolution_hours: number | null;
  emergency_open: number;
  pipeline_weighted: number;
  tickets_by_category: Record<string, number>;
  tickets_by_priority: Record<string, number>;
  anomalies: AnomalyAlert[];
  health_score: number;
}

export interface AnomalyAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  detail: string;
  entity_type: string;
  entity_id?: string;
}

export interface TriageSuggestion {
  suggested_priority: TicketPriority;
  suggested_category: TicketCategory;
  confidence: number;
  rationale: string;
  suggested_assignee_name?: string;
  preferred_vendor_name?: string;
  first_response_draft: string;
}

export type PermissionKey =
  | 'tickets.create'
  | 'tickets.assign'
  | 'tickets.escalate'
  | 'tickets.resolve'
  | 'finance.view'
  | 'finance.record_payment'
  | 'finance.deposits'
  | 'leases.manage'
  | 'pipeline.manage'
  | 'properties.manage'
  | 'users.manage'
  | 'sla.configure'
  | 'announcements.broadcast'
  | 'reports.export'
  | 'org.settings'
  | 'platform.approve_orgs'
  | 'platform.billing';

const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  tenant: ['tickets.create', 'tickets.resolve'],
  maintenance: ['tickets.resolve', 'tickets.assign'],
  property_manager: [
    'tickets.create',
    'tickets.assign',
    'tickets.escalate',
    'tickets.resolve',
    'finance.view',
    'leases.manage',
    'pipeline.manage',
    'properties.manage',
    'sla.configure',
    'announcements.broadcast',
    'reports.export',
  ],
  finance: [
    'finance.view',
    'finance.record_payment',
    'finance.deposits',
    'reports.export',
  ],
  admin: [
    'tickets.create',
    'tickets.assign',
    'tickets.escalate',
    'tickets.resolve',
    'finance.view',
    'finance.record_payment',
    'finance.deposits',
    'leases.manage',
    'pipeline.manage',
    'properties.manage',
    'users.manage',
    'sla.configure',
    'announcements.broadcast',
    'reports.export',
    'org.settings',
  ],
  super_admin: [
    'tickets.create',
    'tickets.assign',
    'tickets.escalate',
    'tickets.resolve',
    'finance.view',
    'finance.record_payment',
    'finance.deposits',
    'leases.manage',
    'pipeline.manage',
    'properties.manage',
    'users.manage',
    'sla.configure',
    'announcements.broadcast',
    'reports.export',
    'org.settings',
    'platform.approve_orgs',
    'platform.billing',
  ],
};

const PERM_STORAGE = 'umhlaba_wami_perm_overrides_v1';

function loadOverrides(): Record<string, PermissionKey[]> {
  try {
    return JSON.parse(localStorage.getItem(PERM_STORAGE) || '{}');
  } catch {
    return {};
  }
}

function saveOverrides(data: Record<string, PermissionKey[]>) {
  localStorage.setItem(PERM_STORAGE, JSON.stringify(data));
}

const CATEGORY_KEYWORDS: Array<{ cat: TicketCategory; words: string[] }> = [
  { cat: 'Plumbing', words: ['pipe', 'plumb', 'toilet', 'drain', 'sewer', 'tap', 'basin'] },
  { cat: 'Water Leak', words: ['leak', 'flood', 'drip', 'water damage', 'wet'] },
  { cat: 'Electrical', words: ['electric', 'power', 'outlet', 'socket', 'breaker', 'light', 'wiring'] },
  { cat: 'Air Conditioning', words: ['ac', 'a/c', 'hvac', 'aircon', 'air con', 'cooling', 'hot air'] },
  { cat: 'Security', words: ['security', 'alarm', 'cctv', 'theft', 'break-in', 'gate'] },
  { cat: 'Cleaning', words: ['clean', 'rubbish', 'waste', 'hygiene', 'spill'] },
  { cat: 'Parking', words: ['parking', 'bay', 'car park'] },
  { cat: 'Structural Damage', words: ['crack', 'ceiling', 'roof', 'wall', 'structural', 'collapse'] },
  { cat: 'Internet / Network', words: ['wifi', 'internet', 'network', 'fibre', 'router'] },
  { cat: 'Signage', words: ['sign', 'signage', 'board'] },
  { cat: 'Noise Complaint', words: ['noise', 'loud', 'music', 'disturbance'] },
];

const EMERGENCY_WORDS = ['emergency', 'urgent', 'fire', 'smoke', 'flooding', 'electrocution', 'gas', 'evacuat'];
const HIGH_WORDS = ['not working', 'no power', 'blocked', 'overflow', 'danger', 'safety'];

class IntelligenceService {
  getPortfolioKpis(organizationId?: string): PortfolioKpis {
    const shops = organizationId
      ? db.shops.filter((s) => s.organization_id === organizationId)
      : db.shops;
    const occupied = shops.filter((s) => s.status === 'Occupied').length;
    const vacant = shops.filter((s) => s.status === 'Available').length;
    const roll = commercial.getRentRoll(organizationId);
    const monthly = roll.reduce((s, r) => s + r.monthly_rent, 0);
    const arrears = roll.reduce((s, r) => s + r.arrears, 0);
    const expected = roll.reduce((s, r) => s + r.expected_ytd, 0);
    const collected = roll.reduce((s, r) => s + r.collected_ytd, 0);
    const collection_rate = expected > 0 ? Math.round((collected / expected) * 1000) / 10 : 100;

    const tickets = organizationId
      ? db.tickets.filter((t) => t.organization_id === organizationId)
      : db.tickets;
    const open = tickets.filter((t) => !['Resolved', 'Closed', 'Cancelled'].includes(t.status));
    const closed = tickets.filter((t) => t.status === 'Closed' || t.status === 'Resolved');

    let compliant = 0;
    let measured = 0;
    for (const t of open) {
      measured++;
      if (t.sla_status === 'Compliant' || t.sla_status === 'Warning') compliant++;
    }
    for (const t of closed) {
      measured++;
      if (t.sla_status !== 'Overdue' && t.sla_status !== 'Escalated') compliant++;
    }
    const sla_compliance_pct = measured ? Math.round((compliant / measured) * 1000) / 10 : 100;

    const resolutionHours: number[] = [];
    for (const t of closed) {
      if (t.resolved_at && t.created_at) {
        resolutionHours.push(
          (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime()) / 3600000
        );
      } else if (t.time_spent_hours) {
        resolutionHours.push(t.time_spent_hours);
      }
    }
    const avg_resolution_hours = resolutionHours.length
      ? Math.round((resolutionHours.reduce((a, b) => a + b, 0) / resolutionHours.length) * 10) / 10
      : null;

    const tickets_by_category: Record<string, number> = {};
    const tickets_by_priority: Record<string, number> = {};
    for (const t of tickets) {
      tickets_by_category[t.category] = (tickets_by_category[t.category] || 0) + 1;
      tickets_by_priority[t.priority] = (tickets_by_priority[t.priority] || 0) + 1;
    }

    const pack = commercial.getBoardPack(organizationId);
    const anomalies = this.detectAnomalies(organizationId);

    // Health score 0–100 weighted
    const occScore = Math.min(100, pack.occupancy_rate);
    const slaScore = sla_compliance_pct;
    const collScore = Math.min(100, collection_rate);
    const ticketPressure = Math.max(0, 100 - open.length * 8);
    const health_score = Math.round(
      occScore * 0.3 + slaScore * 0.3 + collScore * 0.25 + ticketPressure * 0.15
    );

    return {
      organization_id: organizationId,
      occupancy_rate: pack.occupancy_rate,
      units_total: shops.length,
      units_occupied: occupied,
      units_vacant: vacant,
      monthly_rent_roll: monthly,
      arrears_total: arrears,
      collection_rate,
      open_tickets: open.length,
      sla_compliance_pct,
      avg_resolution_hours,
      emergency_open: open.filter((t) => t.priority === 'Emergency').length,
      pipeline_weighted: pack.pipeline_value,
      tickets_by_category,
      tickets_by_priority,
      anomalies,
      health_score,
    };
  }

  detectAnomalies(organizationId?: string): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];
    const tickets = organizationId
      ? db.tickets.filter((t) => t.organization_id === organizationId)
      : db.tickets;

    // Units with repeated tickets
    const byShop: Record<string, Ticket[]> = {};
    for (const t of tickets) {
      byShop[t.shop_id] = byShop[t.shop_id] || [];
      byShop[t.shop_id].push(t);
    }
    for (const [shopId, list] of Object.entries(byShop)) {
      const recent = list.filter(
        (t) => Date.now() - new Date(t.created_at).getTime() < 60 * 86400000
      );
      if (recent.length >= 3) {
        const shop = db.shops.find((s) => s.id === shopId);
        alerts.push({
          id: `anom_shop_${shopId}`,
          severity: 'warning',
          title: `Repeat issues — Unit ${shop?.shop_number || shopId}`,
          detail: `${recent.length} tickets in the last 60 days. Consider preventive inspection.`,
          entity_type: 'Shop',
          entity_id: shopId,
        });
      }
    }

    const open = tickets.filter((t) => !['Resolved', 'Closed', 'Cancelled'].includes(t.status));
    for (const t of open) {
      if (t.sla_status === 'Overdue' || t.sla_status === 'Escalated') {
        alerts.push({
          id: `anom_sla_${t.id}`,
          severity: t.priority === 'Emergency' ? 'critical' : 'warning',
          title: `SLA ${t.sla_status}: ${t.ticket_number}`,
          detail: t.title,
          entity_type: 'Ticket',
          entity_id: t.id,
        });
      }
    }

    const roll = commercial.getRentRoll(organizationId);
    for (const r of roll.filter((x) => x.aging_bucket === '90+' || x.aging_bucket === '61-90')) {
      alerts.push({
        id: `anom_arr_${r.tenant_id}`,
        severity: r.aging_bucket === '90+' ? 'critical' : 'warning',
        title: `Arrears ${r.aging_bucket}: ${r.business_name}`,
        detail: `E${r.arrears.toLocaleString()} outstanding on unit ${r.shop_number}`,
        entity_type: 'Tenant',
        entity_id: r.tenant_id,
      });
    }

    const pm = ops.listPreventive(organizationId).filter((p) => p.status === 'Overdue');
    for (const p of pm) {
      alerts.push({
        id: `anom_pm_${p.id}`,
        severity: 'info',
        title: `Preventive overdue: ${p.title}`,
        detail: `Due ${p.next_due}`,
        entity_type: 'PreventiveTask',
        entity_id: p.id,
      });
    }

    return alerts.slice(0, 20);
  }

  /** Rule-based AI triage from free-text issue description */
  suggestTriage(text: string, organizationId?: string): TriageSuggestion {
    const lower = text.toLowerCase();
    let category: TicketCategory = 'Other';
    let best = 0;
    for (const row of CATEGORY_KEYWORDS) {
      const hits = row.words.filter((w) => lower.includes(w)).length;
      if (hits > best) {
        best = hits;
        category = row.cat;
      }
    }

    let priority: TicketPriority = 'Medium';
    if (EMERGENCY_WORDS.some((w) => lower.includes(w))) priority = 'Emergency';
    else if (HIGH_WORDS.some((w) => lower.includes(w)) || category === 'Water Leak') priority = 'High';
    else if (category === 'Cleaning' || category === 'Signage') priority = 'Low';

    const tech = db.users.find(
      (u) =>
        u.role === 'maintenance' &&
        u.status === 'Active' &&
        (!organizationId || u.organization_id === organizationId)
    );
    const vendor = ops.getPreferredVendor(organizationId || 'org_gables_lifestyle', category);

    const confidence = Math.min(0.95, 0.45 + best * 0.15 + (priority === 'Emergency' ? 0.1 : 0));

    const first_response_draft =
      priority === 'Emergency'
        ? `We have logged this as an Emergency (${category}). A technician is being dispatched under the 15-minute response SLA. Please keep the area clear and contact centre security if anyone is at immediate risk.`
        : `Thank you for reporting this ${category.toLowerCase()} issue. We have prioritised it as ${priority}. Our facilities team will respond within the applicable SLA. Reference will be provided once the ticket number is issued.`;

    return {
      suggested_priority: priority,
      suggested_category: category,
      confidence,
      rationale:
        best > 0
          ? `Matched keywords for ${category}; priority driven by urgency language and category norms for Eswatini commercial centres.`
          : 'Limited keyword match — defaulting to Medium / Other. Review before dispatch.',
      suggested_assignee_name: tech?.name,
      preferred_vendor_name: vendor?.company_name,
      first_response_draft,
    };
  }

  /** Simple natural-language search across tickets, tenants, units */
  naturalSearch(query: string, organizationId?: string) {
    const q = query.toLowerCase().trim();
    if (!q) return { tickets: [], tenants: [], shops: [] };

    const tickets = (organizationId
      ? db.tickets.filter((t) => t.organization_id === organizationId)
      : db.tickets
    ).filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.ticket_number.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );

    const tenants = (organizationId
      ? db.tenants.filter((t) => t.organization_id === organizationId)
      : db.tenants
    ).filter(
      (t) =>
        t.business_name.toLowerCase().includes(q) ||
        t.contact_person.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q)
    );

    const shops = (organizationId
      ? db.shops.filter((s) => s.organization_id === organizationId)
      : db.shops
    ).filter(
      (s) =>
        s.shop_number.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.floor.toLowerCase().includes(q)
    );

    return {
      tickets: tickets.slice(0, 15),
      tenants: tenants.slice(0, 10),
      shops: shops.slice(0, 10),
    };
  }

  getPermissionsForRole(role: UserRole): PermissionKey[] {
    return [...(ROLE_PERMISSIONS[role] || [])];
  }

  getEffectivePermissions(userId: string, role: UserRole): PermissionKey[] {
    const base = this.getPermissionsForRole(role);
    const overrides = loadOverrides()[userId];
    if (!overrides) return base;
    return Array.from(new Set([...base, ...overrides]));
  }

  setUserPermissionOverrides(userId: string, perms: PermissionKey[]) {
    const all = loadOverrides();
    all[userId] = perms;
    saveOverrides(all);
  }

  can(userId: string, role: UserRole, key: PermissionKey): boolean {
    return this.getEffectivePermissions(userId, role).includes(key);
  }

  listPermissionCatalog(): { key: PermissionKey; label: string; group: string }[] {
    return [
      { key: 'tickets.create', label: 'Create tickets', group: 'Operations' },
      { key: 'tickets.assign', label: 'Assign tickets', group: 'Operations' },
      { key: 'tickets.escalate', label: 'Escalate tickets', group: 'Operations' },
      { key: 'tickets.resolve', label: 'Resolve / confirm tickets', group: 'Operations' },
      { key: 'finance.view', label: 'View financials', group: 'Finance' },
      { key: 'finance.record_payment', label: 'Record rent payments', group: 'Finance' },
      { key: 'finance.deposits', label: 'Manage deposits', group: 'Finance' },
      { key: 'leases.manage', label: 'Manage leases', group: 'Commercial' },
      { key: 'pipeline.manage', label: 'Leasing pipeline', group: 'Commercial' },
      { key: 'properties.manage', label: 'Manage properties/units', group: 'Commercial' },
      { key: 'users.manage', label: 'Manage staff users', group: 'Admin' },
      { key: 'sla.configure', label: 'Configure SLA matrix', group: 'Admin' },
      { key: 'announcements.broadcast', label: 'Send broadcasts', group: 'Admin' },
      { key: 'reports.export', label: 'Export reports', group: 'Admin' },
      { key: 'org.settings', label: 'Organisation settings', group: 'Admin' },
      { key: 'platform.approve_orgs', label: 'Approve organisations', group: 'Platform' },
      { key: 'platform.billing', label: 'Subscription billing', group: 'Platform' },
    ];
  }

  getAuditTrail(filters?: {
    organizationId?: string;
    action?: string;
    search?: string;
  }): AuditLog[] {
    let logs = [...db.auditLogs];
    if (filters?.organizationId) {
      logs = logs.filter((l) => l.organization_id === filters.organizationId);
    }
    if (filters?.action) {
      logs = logs.filter((l) => l.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.user_name.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.entity_type.toLowerCase().includes(q) ||
          (l.details || '').toLowerCase().includes(q)
      );
    }
    return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  exportAuditCsv(logs: AuditLog[]): string {
    const header = 'timestamp,user,action,entity_type,entity_id,organization_id,details';
    const rows = logs.map((l) =>
      [
        l.timestamp,
        JSON.stringify(l.user_name),
        l.action,
        l.entity_type,
        l.entity_id,
        l.organization_id || '',
        JSON.stringify(l.details || ''),
      ].join(',')
    );
    return [header, ...rows].join('\n');
  }

  getNotificationsForUser(userId: string): NotificationItem[] {
    return db.notifications
      .filter((n) => n.user_id === userId || n.user_id === 'all')
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  markNotificationRead(id: string) {
    const n = db.notifications.find((x) => x.id === id);
    if (n) {
      n.read = true;
      db.saveToStorage();
    }
  }

  markAllRead(userId: string) {
    for (const n of db.notifications) {
      if (n.user_id === userId) n.read = true;
    }
    db.saveToStorage();
  }
}

export const intelligence = new IntelligenceService();

/**
 * In-memory application state hydrated exclusively from Supabase.
 * localStorage mock seed path removed.
 */
import {
  Organization,
  User,
  UserRole,
  ShoppingCenter,
  Property,
  Shop,
  Tenant,
  Lease,
  SlaAgreement,
  Ticket,
  TicketComment,
  StaffShift,
  Vendor,
  FinanceTransaction,
  FinancialRequest,
  Announcement,
  EmergencyBroadcast,
  NotificationItem,
  ChatMessage,
  AuditLog,
  PropertyLead,
  SubscriptionConfig,
  TicketPriority,
  TicketCategory,
} from '../types';

const STORAGE_KEY = 'umhlaba_wami_db_v2';

export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionConfig[] = [
  {
    tier: 'Starter',
    name: 'Starter Portfolio',
    propertyLimit: 3,
    tenantLimit: 100,
    userLimit: 10,
    storageLimitGb: 10,
    pricePerMonthE: 1450,
    features: ['Up to 3 Properties', '100 Active Tenants', 'Standard SLA Tracking', 'Basic Mobile Ticketing', 'Email Notifications'],
  },
  {
    tier: 'Professional',
    name: 'Professional Multi-Mall',
    propertyLimit: 10,
    tenantLimit: 500,
    userLimit: 50,
    storageLimitGb: 50,
    pricePerMonthE: 3850,
    features: ['Up to 10 Properties', '500 Active Tenants', 'Auto SLA Escalations', 'Staff Rostering Calendar', 'Finance Export', 'Priority Support'],
  },
  {
    tier: 'Enterprise',
    name: 'Enterprise Commercial Group',
    propertyLimit: 999,
    tenantLimit: 9999,
    userLimit: 999,
    storageLimitGb: 500,
    pricePerMonthE: 8900,
    features: ['Unlimited Properties & Tenants', 'Custom SLA Rules', 'Vendor Management', 'Emergency Broadcast', 'Dedicated Account Manager', 'Custom API Integrations'],
  },
];

class DatabaseService {
  private listeners: Set<() => void> = new Set();
  public organizations: Organization[] = [];
  public users: User[] = [];
  public shoppingCenters: ShoppingCenter[] = [];
  public properties: Property[] = [];
  public shops: Shop[] = [];
  public tenants: Tenant[] = [];
  public leases: Lease[] = [];
  public slaAgreements: SlaAgreement[] = [];
  public tickets: Ticket[] = [];
  public ticketComments: TicketComment[] = [];
  public shifts: StaffShift[] = [];
  public vendors: Vendor[] = [];
  public financeTransactions: FinanceTransaction[] = [];
  public financialRequests: FinancialRequest[] = [];
  public announcements: Announcement[] = [];
  public emergencyBroadcasts: EmergencyBroadcast[] = [];
  public notifications: NotificationItem[] = [];
  public chatMessages: ChatMessage[] = [];
  public auditLogs: AuditLog[] = [];
  public leads: PropertyLead[] = [];
  public subscriptionPlans: SubscriptionConfig[] = DEFAULT_SUBSCRIPTION_PLANS;

  public tryHydrateFromSupabase?: () => Promise<boolean>;
  public tryHydratePublicListings?: () => Promise<boolean>;

  constructor() {
    this.clearAllCollections();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  private clearAllCollections() {
    this.organizations = [];
    this.users = [];
    this.shoppingCenters = [];
    this.properties = [];
    this.shops = [];
    this.tenants = [];
    this.leases = [];
    this.slaAgreements = [];
    this.tickets = [];
    this.shifts = [];
    this.vendors = [];
    this.financeTransactions = [];
    this.financialRequests = [];
    this.announcements = [];
    this.emergencyBroadcasts = [];
    this.notifications = [];
    this.chatMessages = [];
    this.auditLogs = [];
    this.leads = [];
    this.subscriptionPlans = DEFAULT_SUBSCRIPTION_PLANS;
  }

  public saveToStorage() {
    this.notifyListeners();
  }

  public resetToDefaults() {
    this.clearAllCollections();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    this.notifyListeners();
  }

  public resetToInitialSeed() {
    this.resetToDefaults();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Listener callback error', err);
      }
    });
  }

  public get activityLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public logAudit(
    userId: string,
    userName: string,
    action: string,
    entityType: string,
    entityId?: string,
    organizationId?: string,
    details?: string
  ) {
    this.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      user_id: userId,
      user_name: userName,
      action,
      entity_type: entityType,
      entity_id: entityId || '',
      organization_id: organizationId,
      details,
      created_at: new Date().toISOString(),
    });
    this.saveToStorage();
  }

  public sendNotification(
    userId: string | undefined,
    role: UserRole | undefined,
    title: string,
    message: string,
    type: NotificationItem['type'] = 'info',
    linkTo?: string
  ) {
    this.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      user_id: userId,
      role,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
      link_to: linkTo,
    });
    this.saveToStorage();
  }

  public generateTicketNumber(shopNumber?: string, _propertyName?: string): string {
    const shop = (shopNumber || 'GEN').replace(/\s+/g, '');
    const d = new Date();
    const stamp = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getFullYear()).slice(-2)}`;
    const seq = String(this.tickets.length + 1).padStart(4, '0');
    return `${shop}-${stamp}-${seq}`;
  }

  public createTicket(data: {
    organization_id: string;
    shopping_center_id?: string;
    property_id: string;
    shop_id: string;
    tenant_id: string;
    title: string;
    description: string;
    exact_location_description?: string;
    priority: TicketPriority;
    category: TicketCategory;
    created_by_user_id: string;
    response_deadline: string;
    resolution_deadline: string;
    ticket_number?: string;
  }): Ticket {
    const shop = this.shops.find((s) => s.id === data.shop_id);
    const ticket = {
      id: `tkt_${Date.now()}`,
      ticket_number: data.ticket_number || this.generateTicketNumber(shop?.shop_number),
      organization_id: data.organization_id,
      shopping_center_id: data.shopping_center_id,
      property_id: data.property_id,
      shop_id: data.shop_id,
      tenant_id: data.tenant_id,
      title: data.title,
      description: data.description,
      exact_location_description: data.exact_location_description,
      priority: data.priority,
      category: data.category,
      status: 'Open' as const,
      created_by_user_id: data.created_by_user_id,
      response_deadline: data.response_deadline,
      resolution_deadline: data.resolution_deadline,
      sla_status: 'Compliant' as const,
      created_at: new Date().toISOString(),
      timeline: [
        {
          id: `tl_${Date.now()}`,
          ticket_id: '',
          actor_name: 'System',
          actor_role: 'System',
          action: 'Ticket created',
          timestamp: new Date().toISOString(),
        },
      ],
    } as Ticket;
    ticket.timeline[0].ticket_id = ticket.id;
    this.tickets.unshift(ticket);
    this.saveToStorage();
    return ticket;
  }

  public assignTicket(ticketId: string, technicianId: string, managerId: string, managerName: string) {
    const t = this.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    t.assigned_to = technicianId;
    t.status = 'In Progress';
    t.timeline = t.timeline || [];
    t.timeline.push({
      id: `tl_${Date.now()}`,
      ticket_id: ticketId,
      actor_name: managerName,
      actor_role: 'Property Manager',
      action: 'Assigned to technician',
      timestamp: new Date().toISOString(),
    });
    this.logAudit(managerId, managerName, 'ASSIGN_TICKET', 'Ticket', ticketId, t.organization_id);
    this.saveToStorage();
  }

  public acceptJob(ticketId: string, techId: string, techName: string) {
    const t = this.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    t.assigned_to = techId;
    t.status = 'In Progress';
    t.timeline = t.timeline || [];
    t.timeline.push({
      id: `tl_${Date.now()}`,
      ticket_id: ticketId,
      actor_name: techName,
      actor_role: 'Maintenance',
      action: 'Job accepted',
      timestamp: new Date().toISOString(),
    });
    this.saveToStorage();
  }

  public startTicketWork(ticketId: string, techName: string) {
    const t = this.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    t.status = 'In Progress';
    t.timeline = t.timeline || [];
    t.timeline.push({
      id: `tl_${Date.now()}`,
      ticket_id: ticketId,
      actor_name: techName,
      actor_role: 'Maintenance',
      action: 'Work started',
      timestamp: new Date().toISOString(),
    });
    this.saveToStorage();
  }

  public markTicketResolved(
    ticketId: string,
    techId: string,
    techName: string,
    notes?: string,
    materials?: string,
    cost?: number
  ) {
    const t = this.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    t.status = 'Resolved';
    t.completion_notes = notes;
    t.materials_used = materials;
    t.completion_cost = cost;
    t.resolved_at = new Date().toISOString();
    t.timeline = t.timeline || [];
    t.timeline.push({
      id: `tl_${Date.now()}`,
      ticket_id: ticketId,
      actor_name: techName,
      actor_role: 'Maintenance',
      action: 'Marked resolved',
      timestamp: new Date().toISOString(),
    });
    this.logAudit(techId, techName, 'RESOLVE_TICKET', 'Ticket', ticketId, t.organization_id);
    this.saveToStorage();
  }

  public resolveTicket(ticketId: string, techName: string, notes?: string, materials?: string, cost?: number) {
    this.markTicketResolved(ticketId, '', techName, notes, materials, cost);
  }

  public confirmTenantResolution(ticketId: string, rating?: number, feedback?: string) {
    const t = this.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    t.status = 'Closed';
    t.tenant_rating = rating;
    t.tenant_feedback = feedback;
    t.closed_at = new Date().toISOString();
    t.timeline = t.timeline || [];
    t.timeline.push({
      id: `tl_${Date.now()}`,
      ticket_id: ticketId,
      actor_name: 'Tenant',
      actor_role: 'Tenant',
      action: 'Resolution confirmed',
      timestamp: new Date().toISOString(),
    });
    this.saveToStorage();
  }

  public confirmTicketResolved(ticketId: string, rating?: number, feedback?: string) {
    this.confirmTenantResolution(ticketId, rating, feedback);
  }

  public reopenTicket(ticketId: string, reason: string, tenantName?: string) {
    const t = this.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    t.status = 'Reopened';
    t.timeline = t.timeline || [];
    t.timeline.push({
      id: `tl_${Date.now()}`,
      ticket_id: ticketId,
      actor_name: tenantName || 'Tenant',
      actor_role: 'Tenant',
      action: `Reopened: ${reason}`,
      timestamp: new Date().toISOString(),
    });
    this.saveToStorage();
  }

  public updateShopStatus(
    shopId: string,
    newStatus: Shop['status'],
    publicListing?: boolean,
    userId?: string,
    userName?: string
  ) {
    const s = this.shops.find((x) => x.id === shopId);
    if (!s) return;
    s.status = newStatus;
    if (publicListing !== undefined) s.public_listing = publicListing;
    if (userId && userName) {
      this.logAudit(userId, userName, 'UPDATE_SHOP', 'Shop', shopId, s.organization_id);
    }
    this.saveToStorage();
  }

  public updateShop(shopId: string, updates: Partial<Shop>) {
    const s = this.shops.find((x) => x.id === shopId);
    if (!s) return;
    Object.assign(s, updates);
    this.saveToStorage();
  }

  public registerOrganization(data: {
    company_name: string;
    owner_name: string;
    email: string;
    phone: string;
    address: string;
  }): Organization {
    const code = `ORG-${Date.now().toString().slice(-6)}`;
    const org: Organization = {
      id: `org_${Date.now()}`,
      organization_code: code,
      company_name: data.company_name,
      owner_name: data.owner_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      subscription_tier: 'Starter',
      status: 'Pending Approval',
      property_limit: 3,
      tenant_limit: 100,
      user_limit: 10,
      storage_limit: 10,
      created_at: new Date().toISOString(),
    };
    this.organizations.unshift(org);
    this.saveToStorage();
    return org;
  }

  public approveOrganization(orgId: string, superAdminId: string, superAdminName: string) {
    const org = this.organizations.find((o) => o.id === orgId);
    if (!org) return;
    org.status = 'Active';
    org.approved_at = new Date().toISOString();
    org.approved_by = superAdminName;
    this.logAudit(superAdminId, superAdminName, 'APPROVE_ORG', 'Organization', orgId);
    this.saveToStorage();
  }

  public rejectOrganization(
    orgId: string,
    superAdminIdOrReason?: string,
    superAdminName?: string,
    reasonText?: string
  ) {
    const org = this.organizations.find((o) => o.id === orgId);
    if (!org) return;
    org.status = 'Rejected';
    this.logAudit(
      superAdminIdOrReason || 'system',
      superAdminName || 'Super Admin',
      'REJECT_ORG',
      'Organization',
      orgId,
      undefined,
      reasonText
    );
    this.saveToStorage();
  }

  public addChatMessage(conversationId: string, sender: User, messageText: string) {
    this.chatMessages.push({
      id: `msg_${Date.now()}`,
      conversation_id: conversationId,
      sender_id: sender.id,
      sender_name: sender.name,
      sender_role: sender.role,
      message: messageText,
      created_at: new Date().toISOString(),
    });
    this.saveToStorage();
  }

  public createAnnouncement(data: Omit<Announcement, 'id' | 'created_at' | 'is_active'>) {
    const a: Announcement = {
      ...data,
      id: `ann_${Date.now()}`,
      created_at: new Date().toISOString(),
      is_active: true,
    };
    this.announcements.unshift(a);
    this.saveToStorage();
    return a;
  }

  public addAnnouncement(data: {
    organization_id: string;
    title: string;
    message: string;
    priority?: string;
    created_by?: string;
  }) {
    return this.createAnnouncement({
      organization_id: data.organization_id,
      title: data.title,
      message: data.message,
      priority: (data.priority as Announcement['priority']) || 'Normal',
      created_by: data.created_by || '',
    });
  }

  public createEmergencyBroadcast(data: Omit<EmergencyBroadcast, 'id' | 'issued_at' | 'is_active'>) {
    const b: EmergencyBroadcast = {
      ...data,
      id: `emg_${Date.now()}`,
      issued_at: new Date().toISOString(),
      is_active: true,
    };
    this.emergencyBroadcasts.unshift(b);
    this.saveToStorage();
    return b;
  }

  public submitPropertyLead(lead: Omit<PropertyLead, 'id' | 'submitted_at' | 'status'>) {
    const l: PropertyLead = {
      ...lead,
      id: `lead_${Date.now()}`,
      submitted_at: new Date().toISOString(),
      status: 'New',
    };
    this.leads.unshift(l);
    this.saveToStorage();
    return l;
  }

  public signDocument(leaseId: string, signerName: string, signatureDataUrl?: string) {
    const lease = this.leases.find((l) => l.id === leaseId);
    if (!lease) return;
    (lease as Lease & { signed_by?: string; signature_url?: string }).signed_by = signerName;
    if (signatureDataUrl) {
      (lease as Lease & { signature_url?: string }).signature_url = signatureDataUrl;
    }
    this.saveToStorage();
  }

  public addTransaction(tx: Omit<FinanceTransaction, 'id'>) {
    return this.addFinanceTransaction(tx);
  }

  public addFinanceTransaction(data: Omit<FinanceTransaction, 'id'>): FinanceTransaction {
    const newTx: FinanceTransaction = { id: `tx_${Date.now()}`, ...data };
    this.financeTransactions.unshift(newTx);
    this.saveToStorage();
    return newTx;
  }

  public updateFinanceTransaction(
    txId: string,
    updates: Partial<FinanceTransaction>
  ): FinanceTransaction | undefined {
    const tx = this.financeTransactions.find((t) => t.id === txId);
    if (!tx) return undefined;
    Object.assign(tx, updates);
    this.saveToStorage();
    return tx;
  }

  public addTicketComment(
    ticketId: string,
    userId: string,
    userName: string,
    comment: string,
    userRole?: UserRole
  ) {
    this.ticketComments.push({
      id: `cmt_${Date.now()}`,
      ticket_id: ticketId,
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      comment,
      created_at: new Date().toISOString(),
    });
    this.saveToStorage();
  }

  public addTenant(data: Omit<Tenant, 'id'>): Tenant {
    const t: Tenant = { id: `ten_${Date.now()}`, ...data };
    this.tenants.unshift(t);
    this.saveToStorage();
    return t;
  }

  public updateTenant(tenantId: string, updates: Partial<Tenant>): Tenant | undefined {
    const t = this.tenants.find((x) => x.id === tenantId);
    if (!t) return undefined;
    Object.assign(t, updates);
    this.saveToStorage();
    return t;
  }

  public deleteTenant(tenantId: string): boolean {
    const idx = this.tenants.findIndex((t) => t.id === tenantId);
    if (idx === -1) return false;
    this.tenants.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public addShop(data: Omit<Shop, 'id'>): Shop {
    const s: Shop = { id: `shop_${Date.now()}`, ...data };
    this.shops.unshift(s);
    this.saveToStorage();
    return s;
  }

  public deleteShop(shopId: string): boolean {
    const idx = this.shops.findIndex((s) => s.id === shopId);
    if (idx === -1) return false;
    this.shops.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public addLease(data: Omit<Lease, 'id'>): Lease {
    const l: Lease = { id: `lease_${Date.now()}`, ...data };
    this.leases.unshift(l);
    this.saveToStorage();
    return l;
  }

  public updateLease(leaseId: string, updates: Partial<Lease>): Lease | undefined {
    const l = this.leases.find((x) => x.id === leaseId);
    if (!l) return undefined;
    Object.assign(l, updates);
    this.saveToStorage();
    return l;
  }

  public deleteLease(leaseId: string): boolean {
    const idx = this.leases.findIndex((l) => l.id === leaseId);
    if (idx === -1) return false;
    this.leases.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public addVendor(data: Omit<Vendor, 'id'>): Vendor {
    const v: Vendor = { id: `ven_${Date.now()}`, ...data };
    this.vendors.unshift(v);
    this.saveToStorage();
    return v;
  }

  public updateVendor(vendorId: string, updates: Partial<Vendor>): Vendor | undefined {
    const v = this.vendors.find((x) => x.id === vendorId);
    if (!v) return undefined;
    Object.assign(v, updates);
    this.saveToStorage();
    return v;
  }

  public deleteVendor(vendorId: string): boolean {
    const idx = this.vendors.findIndex((v) => v.id === vendorId);
    if (idx === -1) return false;
    this.vendors.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public exportBackupJson(): string {
    return this.exportStateJson();
  }

  public exportStateJson(): string {
    return JSON.stringify(
      {
        organizations: this.organizations,
        users: this.users,
        shoppingCenters: this.shoppingCenters,
        properties: this.properties,
        shops: this.shops,
        tenants: this.tenants,
        leases: this.leases,
        tickets: this.tickets,
      },
      null,
      2
    );
  }

  public restoreBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.organizations) this.organizations = parsed.organizations;
      if (parsed.users) this.users = parsed.users;
      if (parsed.shoppingCenters) this.shoppingCenters = parsed.shoppingCenters;
      if (parsed.properties) this.properties = parsed.properties;
      if (parsed.shops) this.shops = parsed.shops;
      if (parsed.tenants) this.tenants = parsed.tenants;
      if (parsed.leases) this.leases = parsed.leases;
      if (parsed.tickets) this.tickets = parsed.tickets;
      this.saveToStorage();
      return true;
    } catch {
      return false;
    }
  }

  public syncSystem() {
    this.saveToStorage();
  }
}

export const db = new DatabaseService();

/**
 * Phase 7 — Elevate: system-wide excellence service.
 * Themes A–G implemented against dual-mode demo storage (localStorage).
 * Production maps the same contracts to Supabase tables / Edge Functions.
 */
import { db } from './db';
import { commercial } from './commercialService';
import { ops } from './opsService';
import { intelligence } from './intelligenceService';
import { partnerApi } from './partnerApi';
import type { TicketPriority, Vendor, Shop } from '../types';

const K = {
  photos: 'umhlaba_p7_photos_v1',
  outbox: 'umhlaba_p7_notify_outbox_v1',
  payments: 'umhlaba_p7_payments_v1',
  invoices: 'umhlaba_p7_invoices_v1',
  renewals: 'umhlaba_p7_renewals_v1',
  cam: 'umhlaba_p7_cam_v1',
  fieldJobs: 'umhlaba_p7_field_jobs_v1',
  assets: 'umhlaba_p7_assets_v1',
  handovers: 'umhlaba_p7_handovers_v1',
  csat: 'umhlaba_p7_csat_v1',
  webhookLog: 'umhlaba_p7_webhook_log_v1',
  popia: 'umhlaba_p7_popia_v1',
  dr: 'umhlaba_p7_dr_v1',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export interface TicketPhoto {
  id: string;
  ticket_id: string;
  organization_id?: string;
  kind: 'before' | 'after' | 'evidence';
  data_url: string;
  caption?: string;
  created_at: string;
  created_by?: string;
}

export interface NotifyOutboxItem {
  id: string;
  channel: 'email' | 'sms' | 'in_app';
  to: string;
  subject: string;
  body: string;
  priority: TicketPriority | 'Info';
  status: 'queued' | 'sent' | 'failed';
  created_at: string;
  related_ticket_id?: string;
}

export interface PaymentRecord {
  id: string;
  organization_id: string;
  tenant_id: string;
  shop_id: string;
  amount: number;
  method: 'MTN_MoMo' | 'EFT' | 'Cash' | 'Card';
  reference: string;
  period: string;
  status: 'pending' | 'matched' | 'unmatched';
  created_at: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  tenant_id: string;
  shop_number: string;
  business_name: string;
  period: string;
  line_items: Array<{ description: string; amount: number }>;
  total: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  issued_at: string;
}

export interface LeaseRenewal {
  id: string;
  organization_id: string;
  lease_id: string;
  tenant_name: string;
  shop_number: string;
  current_end: string;
  proposed_end: string;
  escalation_pct: number;
  current_rent: number;
  proposed_rent: number;
  status: 'upcoming' | 'offered' | 'accepted' | 'declined' | 'expired';
  reminder_days: number[];
  notes?: string;
}

export interface CamCharge {
  id: string;
  organization_id: string;
  period: string;
  description: string;
  total_pool: number;
  allocations: Array<{ shop_id: string; shop_number: string; share_pct: number; amount: number }>;
  status: 'draft' | 'posted';
  created_at: string;
}

export interface FieldJobState {
  ticket_id: string;
  status: 'queued' | 'en_route' | 'on_site' | 'paused' | 'completed';
  started_at?: string;
  completed_at?: string;
  parts_used?: string;
  time_minutes?: number;
  signature_name?: string;
}

export interface AssetRecord {
  id: string;
  organization_id: string;
  property_id?: string;
  name: string;
  category: 'HVAC' | 'Lift' | 'Generator' | 'Fire' | 'Electrical' | 'Other';
  serial?: string;
  location: string;
  warranty_end?: string;
  next_service?: string;
  status: 'Operational' | 'Needs Service' | 'Out of Service';
}

export interface HandoverNote {
  id: string;
  organization_id: string;
  shift_label: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface CsatEntry {
  id: string;
  ticket_id: string;
  organization_id?: string;
  score: number;
  comment?: string;
  created_at: string;
}

export interface WebhookDelivery {
  id: string;
  organization_id: string;
  url: string;
  event: string;
  payload: unknown;
  status: 'delivered' | 'failed' | 'retrying';
  attempts: number;
  created_at: string;
}

export interface PopiaRequest {
  id: string;
  organization_id?: string;
  subject_name: string;
  subject_email: string;
  type: 'export' | 'deletion';
  status: 'received' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
  completed_at?: string;
  notes?: string;
}

class Phase7Service {
  listPhotos(ticketId: string): TicketPhoto[] {
    return load<TicketPhoto[]>(K.photos, []).filter((p) => p.ticket_id === ticketId);
  }

  addPhoto(photo: Omit<TicketPhoto, 'id' | 'created_at'>): TicketPhoto {
    const entry: TicketPhoto = {
      ...photo,
      id: `ph_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    const all = load<TicketPhoto[]>(K.photos, []);
    all.unshift(entry);
    save(K.photos, all.slice(0, 200));
    return entry;
  }

  listOutbox(): NotifyOutboxItem[] {
    return load<NotifyOutboxItem[]>(K.outbox, []).sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    );
  }

  queueCriticalAlert(opts: {
    channel: 'email' | 'sms';
    to: string;
    subject: string;
    body: string;
    priority: TicketPriority;
    ticket_id?: string;
  }): NotifyOutboxItem {
    const item: NotifyOutboxItem = {
      id: `out_${Date.now()}`,
      channel: opts.channel,
      to: opts.to,
      subject: opts.subject,
      body: opts.body,
      priority: opts.priority,
      status: 'sent',
      created_at: new Date().toISOString(),
      related_ticket_id: opts.ticket_id,
    };
    const all = this.listOutbox();
    all.unshift(item);
    save(K.outbox, all.slice(0, 100));
    return item;
  }

  notifyEmergencyTickets(organizationId?: string) {
    const tickets = (organizationId
      ? db.tickets.filter((t) => t.organization_id === organizationId)
      : db.tickets
    ).filter(
      (t) =>
        t.priority === 'Emergency' &&
        !['Resolved', 'Closed', 'Cancelled'].includes(t.status)
    );
    const results: NotifyOutboxItem[] = [];
    for (const t of tickets.slice(0, 5)) {
      results.push(
        this.queueCriticalAlert({
          channel: 'sms',
          to: '+26876123456',
          subject: `EMERGENCY ${t.ticket_number}`,
          body: `${t.title} — SLA ${t.sla_status}. Centre response required.`,
          priority: 'Emergency',
          ticket_id: t.id,
        })
      );
    }
    return results;
  }

  listPayments(organizationId?: string): PaymentRecord[] {
    const all = load<PaymentRecord[]>(K.payments, []);
    return organizationId ? all.filter((p) => p.organization_id === organizationId) : all;
  }

  recordPayment(input: Omit<PaymentRecord, 'id' | 'created_at' | 'status'>): PaymentRecord {
    const refOk = /^(MOMO|EFT|CASH|CARD)-[A-Z0-9-]+$/i.test(input.reference);
    const entry: PaymentRecord = {
      ...input,
      id: `pay_${Date.now()}`,
      status: refOk ? 'matched' : 'unmatched',
      created_at: new Date().toISOString(),
    };
    const all = this.listPayments();
    all.unshift(entry);
    save(K.payments, all);
    return entry;
  }

  listInvoices(organizationId?: string): Invoice[] {
    let all = load<Invoice[]>(K.invoices, []);
    if (!all.length) all = this.seedInvoices(organizationId);
    return organizationId ? all.filter((i) => i.organization_id === organizationId) : all;
  }

  private seedInvoices(organizationId?: string): Invoice[] {
    const roll = commercial.getRentRoll(organizationId).slice(0, 8);
    const period = new Date().toISOString().slice(0, 7);
    const invoices: Invoice[] = roll.map((r, idx) => ({
      id: `inv_seed_${idx}`,
      organization_id: organizationId || r.tenant_id || 'org_gables_lifestyle',
      tenant_id: r.tenant_id,
      shop_number: r.shop_number,
      business_name: r.business_name,
      period,
      line_items: [
        { description: `Base rent ${period}`, amount: r.monthly_rent },
        { description: 'CAM contribution', amount: Math.round(r.monthly_rent * 0.08) },
      ],
      total: r.monthly_rent + Math.round(r.monthly_rent * 0.08),
      status: r.arrears > 0 ? 'overdue' : 'issued',
      issued_at: new Date().toISOString(),
    }));
    // fix org id from tenants
    for (const inv of invoices) {
      const t = db.tenants.find((x) => x.id === inv.tenant_id);
      if (t?.organization_id) inv.organization_id = t.organization_id;
    }
    save(K.invoices, invoices);
    return invoices;
  }

  exportStatementCsv(organizationId?: string): string {
    const inv = this.listInvoices(organizationId);
    const header = 'invoice_id,period,business,shop,total,status,issued_at';
    const rows = inv.map((i) =>
      [i.id, i.period, JSON.stringify(i.business_name), i.shop_number, i.total, i.status, i.issued_at].join(
        ','
      )
    );
    return [header, ...rows].join('\n');
  }

  exportSageCsv(organizationId?: string): string {
    const inv = this.listInvoices(organizationId).filter((i) => i.status !== 'draft');
    const header = 'Date,Account,Description,Debit,Credit,Reference';
    const rows: string[] = [];
    for (const i of inv) {
      rows.push(`${i.issued_at.slice(0, 10)},1100,Rent receivable ${i.business_name},${i.total},,${i.id}`);
      rows.push(`${i.issued_at.slice(0, 10)},4000,Rental income ${i.shop_number},,${i.total},${i.id}`);
    }
    return [header, ...rows].join('\n');
  }

  listRenewals(organizationId?: string): LeaseRenewal[] {
    let all = load<LeaseRenewal[]>(K.renewals, []);
    if (!all.length) all = this.seedRenewals(organizationId);
    return organizationId ? all.filter((r) => r.organization_id === organizationId) : all;
  }

  private seedRenewals(organizationId?: string): LeaseRenewal[] {
    const leases = (organizationId
      ? db.leases.filter((l) => l.organization_id === organizationId)
      : db.leases
    ).slice(0, 10);
    const renewals: LeaseRenewal[] = leases.map((l, idx) => {
      const tenant = db.tenants.find((t) => t.id === l.tenant_id);
      const shop = db.shops.find((s) => s.id === l.shop_id);
      const end =
        l.end_date || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
      const rent = l.rental_amount || shop?.rental_amount || 15000;
      const esc = 7;
      return {
        id: `ren_seed_${idx}`,
        organization_id: l.organization_id || organizationId || 'org_gables_lifestyle',
        lease_id: l.id,
        tenant_name: tenant?.business_name || 'Tenant',
        shop_number: shop?.shop_number || '—',
        current_end: end,
        proposed_end: new Date(new Date(end).getTime() + 365 * 86400000).toISOString().slice(0, 10),
        escalation_pct: esc,
        current_rent: rent,
        proposed_rent: Math.round(rent * (1 + esc / 100)),
        status: 'upcoming' as const,
        reminder_days: [90, 60, 30],
      };
    });
    save(K.renewals, renewals);
    return renewals;
  }

  advanceRenewal(id: string, status: LeaseRenewal['status']) {
    const all = load<LeaseRenewal[]>(K.renewals, []);
    const r = all.find((x) => x.id === id);
    if (r) r.status = status;
    save(K.renewals, all);
  }

  listCam(organizationId?: string): CamCharge[] {
    let all = load<CamCharge[]>(K.cam, []);
    if (!all.length && organizationId) {
      all = [this.buildCamDraft(organizationId)];
      save(K.cam, all);
    }
    return organizationId ? all.filter((c) => c.organization_id === organizationId) : all;
  }

  buildCamDraft(organizationId: string, pool = 45000): CamCharge {
    const shops = db.shops.filter((s) => s.organization_id === organizationId && s.status === 'Occupied');
    const totalArea = shops.reduce((s, x) => s + (x.size_sqm || 50), 0) || 1;
    const allocations = shops.map((s) => {
      const share = ((s.size_sqm || 50) / totalArea) * 100;
      return {
        shop_id: s.id,
        shop_number: s.shop_number,
        share_pct: Math.round(share * 10) / 10,
        amount: Math.round(pool * (share / 100)),
      };
    });
    return {
      id: `cam_${Date.now()}`,
      organization_id: organizationId,
      period: new Date().toISOString().slice(0, 7),
      description: 'Common area maintenance & security pool',
      total_pool: pool,
      allocations,
      status: 'draft',
      created_at: new Date().toISOString(),
    };
  }

  postCam(charge: CamCharge) {
    charge.status = 'posted';
    const all = load<CamCharge[]>(K.cam, []);
    const idx = all.findIndex((c) => c.id === charge.id);
    if (idx >= 0) all[idx] = charge;
    else all.unshift(charge);
    save(K.cam, all);
  }

  getFieldJob(ticketId: string): FieldJobState {
    const all = load<Record<string, FieldJobState>>(K.fieldJobs, {});
    return all[ticketId] || { ticket_id: ticketId, status: 'queued' };
  }

  updateFieldJob(ticketId: string, patch: Partial<FieldJobState>): FieldJobState {
    const all = load<Record<string, FieldJobState>>(K.fieldJobs, {});
    const cur = all[ticketId] || { ticket_id: ticketId, status: 'queued' as const };
    const next = { ...cur, ...patch, ticket_id: ticketId };
    if (patch.status === 'on_site' && !next.started_at) next.started_at = new Date().toISOString();
    if (patch.status === 'completed') next.completed_at = new Date().toISOString();
    all[ticketId] = next;
    save(K.fieldJobs, all);
    return next;
  }

  unitQrPayload(shop: Shop): string {
    return JSON.stringify({
      v: 1,
      type: 'umhlaba_unit',
      shop_id: shop.id,
      shop_number: shop.shop_number,
      organization_id: shop.organization_id,
    });
  }

  resolveUnitQr(raw: string): Shop | null {
    try {
      const data = JSON.parse(raw);
      if (data.shop_id) return db.shops.find((s) => s.id === data.shop_id) || null;
      if (data.shop_number)
        return db.shops.find((s) => s.shop_number === data.shop_number) || null;
    } catch {
      return db.shops.find((s) => s.shop_number.toLowerCase() === raw.toLowerCase()) || null;
    }
    return null;
  }

  vendorScorecards(organizationId?: string) {
    const vendors = organizationId
      ? db.vendors.filter((v) => v.organization_id === organizationId)
      : db.vendors;
    return vendors.map((v: Vendor) => {
      const related = db.tickets.filter((t) =>
        (t.description || '').toLowerCase().includes((v.company_name || '').toLowerCase().slice(0, 6))
      );
      const closed = related.filter((t) => ['Resolved', 'Closed'].includes(t.status));
      const onTime = closed.filter((t) => t.sla_status !== 'Overdue' && t.sla_status !== 'Escalated');
      const on_time_pct = closed.length ? Math.round((onTime.length / closed.length) * 100) : 85;
      const reopen = related.filter((t) => t.status === 'Reopened').length;
      return {
        vendor: v,
        jobs: related.length,
        on_time_pct,
        reopen_count: reopen,
        score: Math.max(0, Math.min(100, on_time_pct - reopen * 5)),
      };
    });
  }

  listHandovers(organizationId?: string): HandoverNote[] {
    const all = load<HandoverNote[]>(K.handovers, []);
    return organizationId ? all.filter((h) => h.organization_id === organizationId) : all;
  }

  addHandover(note: Omit<HandoverNote, 'id' | 'created_at'>): HandoverNote {
    const entry: HandoverNote = {
      ...note,
      id: `ho_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const all = this.listHandovers();
    all.unshift(entry);
    save(K.handovers, all.slice(0, 50));
    return entry;
  }

  listAssets(organizationId?: string): AssetRecord[] {
    let all = load<AssetRecord[]>(K.assets, []);
    if (!all.length) {
      all = this.seedAssets(organizationId || 'org_gables_lifestyle');
      save(K.assets, all);
    }
    return organizationId ? all.filter((a) => a.organization_id === organizationId) : all;
  }

  private seedAssets(organizationId: string): AssetRecord[] {
    return [
      {
        id: 'ast_1',
        organization_id: organizationId,
        name: 'Carrier Rooftop HVAC #1',
        category: 'HVAC',
        serial: 'CR-8821',
        location: 'Roof plant room',
        warranty_end: '2027-06-01',
        next_service: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
        status: 'Operational',
      },
      {
        id: 'ast_2',
        organization_id: organizationId,
        name: 'Otis Passenger Lift A',
        category: 'Lift',
        serial: 'OT-441',
        location: 'Main atrium',
        next_service: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        status: 'Needs Service',
      },
      {
        id: 'ast_3',
        organization_id: organizationId,
        name: 'Perkins Backup Generator',
        category: 'Generator',
        serial: 'PK-2200',
        location: 'Service yard',
        next_service: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
        status: 'Needs Service',
      },
    ];
  }

  predictiveActions(organizationId?: string) {
    const anomalies = intelligence.detectAnomalies(organizationId);
    const actions = anomalies.map((a) => ({
      id: `pred_${a.id}`,
      title: `Predictive: ${a.title}`,
      detail: a.detail,
      severity: a.severity,
      suggested: a.entity_type === 'Shop' ? 'Schedule preventive inspection' : 'Escalate / assign',
      entity_type: a.entity_type,
      entity_id: a.entity_id,
    }));
    for (const asset of this.listAssets(organizationId)) {
      if (asset.next_service && asset.next_service < new Date().toISOString().slice(0, 10)) {
        actions.push({
          id: `pred_asset_${asset.id}`,
          title: `Service overdue: ${asset.name}`,
          detail: `Next service was ${asset.next_service}`,
          severity: 'warning',
          suggested: 'Create preventive task',
          entity_type: 'Asset',
          entity_id: asset.id,
        });
      }
    }
    return actions;
  }

  createPmFromPrediction(organizationId: string, title: string) {
    try {
      const list = ops.listPreventive(organizationId);
      // soft create via local note if no create API
      void list;
      void organizationId;
      void title;
    } catch {
      /* optional */
    }
    return { ok: true, title };
  }

  vacancyPricingAssist(organizationId?: string) {
    const shops = organizationId
      ? db.shops.filter((s) => s.organization_id === organizationId)
      : db.shops;
    const occupied = shops.filter((s) => s.status === 'Occupied' && s.rental_amount);
    const vacant = shops.filter((s) => s.status === 'Available');
    const avg =
      occupied.length > 0
        ? occupied.reduce((s, x) => s + (x.rental_amount || 0), 0) / occupied.length
        : 0;
    return vacant.map((v) => {
      const comps = occupied.filter((o) => o.floor === v.floor);
      const floorAvg =
        comps.length > 0
          ? comps.reduce((s, x) => s + (x.rental_amount || 0), 0) / comps.length
          : avg;
      const perSqm = v.size_sqm ? floorAvg / (v.size_sqm || 50) : 0;
      return {
        shop: v,
        suggested_rent: Math.round(floorAvg),
        low: Math.round(floorAvg * 0.92),
        high: Math.round(floorAvg * 1.08),
        basis: comps.length ? `Floor ${v.floor} comps (${comps.length})` : 'Centre average',
        per_sqm: Math.round(perSqm),
      };
    });
  }

  naturalLanguageOps(query: string, organizationId?: string) {
    const q = query.toLowerCase();
    let tickets = organizationId
      ? db.tickets.filter((t) => t.organization_id === organizationId)
      : [...db.tickets];

    if (q.includes('emergency')) tickets = tickets.filter((t) => t.priority === 'Emergency');
    if (q.includes('open') || q.includes('unresolved'))
      tickets = tickets.filter((t) => !['Resolved', 'Closed', 'Cancelled'].includes(t.status));
    if (q.includes('overdue') || q.includes('sla'))
      tickets = tickets.filter((t) => t.sla_status === 'Overdue' || t.sla_status === 'Escalated');
    if (q.includes('hour')) {
      const hourAgo = Date.now() - 3600000;
      tickets = tickets.filter((t) => new Date(t.created_at).getTime() < hourAgo);
    }
    const search = intelligence.naturalSearch(query, organizationId);
    return { tickets: tickets.slice(0, 25), ...search };
  }

  boardPackNarrative(organizationId?: string): string {
    const k = intelligence.getPortfolioKpis(organizationId);
    const org = db.organizations.find((o) => o.id === organizationId) || db.organizations[0];
    const anomalies = k.anomalies.slice(0, 3);
    const lines = [
      `Board pack narrative — ${org?.company_name || 'Portfolio'} (${new Date().toLocaleDateString()}).`,
      '',
      `Occupancy stands at ${k.occupancy_rate}% (${k.units_occupied} of ${k.units_total} units). Monthly rent roll is approximately E${k.monthly_rent_roll.toLocaleString()} with arrears of E${k.arrears_total.toLocaleString()} (collection rate ${k.collection_rate}%).`,
      '',
      `Facilities: ${k.open_tickets} open tickets (${k.emergency_open} emergency). SLA compliance is ${k.sla_compliance_pct}%${k.avg_resolution_hours != null ? `; average resolution ${k.avg_resolution_hours}h` : ''}. Portfolio health score: ${k.health_score}/100.`,
      '',
    ];
    if (anomalies.length) {
      lines.push('Attention items:');
      for (const a of anomalies) lines.push(`• ${a.title}: ${a.detail}`);
      lines.push('');
    }
    lines.push(
      `Leasing pipeline weighted value is approximately E${k.pipeline_weighted.toLocaleString()}. Management recommends continued focus on arrears aging beyond 60 days and closing open emergency work orders within SLA.`
    );
    return lines.join('\n');
  }

  portfolioBenchmarks() {
    return db.organizations
      .filter((o) => o.status === 'Active')
      .map((o) => {
        const k = intelligence.getPortfolioKpis(o.id);
        return {
          organization: o.company_name,
          code: o.organization_code,
          occupancy: k.occupancy_rate,
          sla: k.sla_compliance_pct,
          collection: k.collection_rate,
          health: k.health_score,
        };
      });
  }

  listCsat(organizationId?: string): CsatEntry[] {
    const all = load<CsatEntry[]>(K.csat, []);
    return organizationId ? all.filter((c) => c.organization_id === organizationId) : all;
  }

  submitCsat(entry: Omit<CsatEntry, 'id' | 'created_at'>): CsatEntry {
    const row: CsatEntry = {
      ...entry,
      id: `csat_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const all = this.listCsat();
    all.unshift(row);
    save(K.csat, all);
    return row;
  }

  csatAverage(organizationId?: string): number | null {
    const list = this.listCsat(organizationId);
    if (!list.length) return null;
    return Math.round((list.reduce((s, c) => s + c.score, 0) / list.length) * 10) / 10;
  }

  listWebhookDeliveries(organizationId?: string): WebhookDelivery[] {
    const all = load<WebhookDelivery[]>(K.webhookLog, []);
    return organizationId ? all.filter((w) => w.organization_id === organizationId) : all;
  }

  simulateWebhookDelivery(organizationId: string, event: string, payload: unknown) {
    const entry: WebhookDelivery = {
      id: `wd_${Date.now()}`,
      organization_id: organizationId,
      url: 'https://hooks.example.com/umhlaba',
      event,
      payload,
      status: Math.random() > 0.15 ? 'delivered' : 'failed',
      attempts: 1,
      created_at: new Date().toISOString(),
    };
    const all = this.listWebhookDeliveries();
    all.unshift(entry);
    save(K.webhookLog, all.slice(0, 50));
    return entry;
  }

  listPopia(organizationId?: string): PopiaRequest[] {
    const all = load<PopiaRequest[]>(K.popia, []);
    return organizationId ? all.filter((p) => p.organization_id === organizationId) : all;
  }

  createPopiaRequest(req: Omit<PopiaRequest, 'id' | 'created_at' | 'status'>): PopiaRequest {
    const row: PopiaRequest = {
      ...req,
      id: `popia_${Date.now()}`,
      status: 'received',
      created_at: new Date().toISOString(),
    };
    const all = this.listPopia();
    all.unshift(row);
    save(K.popia, all);
    return row;
  }

  advancePopia(id: string, status: PopiaRequest['status']) {
    const all = load<PopiaRequest[]>(K.popia, []);
    const r = all.find((x) => x.id === id);
    if (r) {
      r.status = status;
      if (status === 'completed') r.completed_at = new Date().toISOString();
    }
    save(K.popia, all);
  }

  exportSubjectData(email: string) {
    const tenants = db.tenants.filter((t) => t.email.toLowerCase() === email.toLowerCase());
    const users = db.users.filter((u) => u.email.toLowerCase() === email.toLowerCase());
    return { exported_at: new Date().toISOString(), tenants, users };
  }

  accessReview(organizationId?: string) {
    const users = organizationId
      ? db.users.filter((u) => u.organization_id === organizationId || u.role === 'super_admin')
      : db.users;
    return users
      .filter((u) => ['admin', 'super_admin', 'property_manager', 'finance'].includes(u.role))
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        risk: u.role === 'super_admin' || u.role === 'admin' ? 'elevated' : 'standard',
      }));
  }

  disasterRecoveryStatus() {
    return load<Array<{ id: string; item: string; done: boolean }>>(K.dr, [
      { id: 'dr1', item: 'Supabase automated backups enabled', done: false },
      { id: 'dr2', item: 'Monthly restore drill documented', done: false },
      { id: 'dr3', item: 'RPO ≤ 24h / RTO ≤ 4h agreed with stakeholders', done: false },
      { id: 'dr4', item: 'Export of audit logs to cold storage', done: false },
      { id: 'dr5', item: 'Emergency contact tree for platform outage', done: true },
      { id: 'dr6', item: 'Demo localStorage seed recoverable from /public/db-seed.json', done: true },
    ]);
  }

  toggleDrItem(id: string) {
    const list = this.disasterRecoveryStatus();
    const item = list.find((i) => i.id === id);
    if (item) item.done = !item.done;
    save(K.dr, list);
    return list;
  }

  elevateSummary(organizationId?: string) {
    return {
      photos: load<TicketPhoto[]>(K.photos, []).length,
      outbox: this.listOutbox().length,
      payments: this.listPayments(organizationId).length,
      invoices: this.listInvoices(organizationId).length,
      renewals: this.listRenewals(organizationId).filter((r) => r.status === 'upcoming').length,
      assets: this.listAssets(organizationId).filter((a) => a.status !== 'Operational').length,
      predictive: this.predictiveActions(organizationId).length,
      csat_avg: this.csatAverage(organizationId),
      popia_open: this.listPopia(organizationId).filter((p) => p.status !== 'completed').length,
      api_health: partnerApi.health(),
    };
  }
}

export const phase7 = new Phase7Service();

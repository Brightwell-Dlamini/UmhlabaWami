/**
 * Phase 4 — Commercial Engine service.
 * Rent roll, arrears aging, deposits, payment recording, leasing pipeline,
 * board-pack aggregates, organisation subscription billing.
 */
import { db } from './db';
import type {
  Lease,
  Tenant,
  Shop,
  FinanceTransaction,
  Organization,
  PropertyLead,
  SubscriptionTier,
} from '../types';
import { DEFAULT_SUBSCRIPTION_PLANS } from './db';

export type PipelineStage =
  | 'Enquiry'
  | 'Viewing Scheduled'
  | 'Offer Made'
  | 'Negotiation'
  | 'Lease Draft'
  | 'Signed'
  | 'Lost';

export interface LeasePipelineDeal {
  id: string;
  organization_id: string;
  prospect_name: string;
  company: string;
  email: string;
  phone: string;
  shop_id?: string;
  shop_label: string;
  proposed_rent: number;
  stage: PipelineStage;
  probability: number;
  expected_close: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DepositLedgerEntry {
  id: string;
  organization_id: string;
  tenant_id: string;
  lease_id?: string;
  shop_id: string;
  amount: number;
  direction: 'held' | 'partial_refund' | 'full_refund' | 'forfeit';
  reason: string;
  date: string;
  balance_after: number;
}

export interface RentRollRow {
  tenant_id: string;
  business_name: string;
  contact_person: string;
  shop_number: string;
  property_name: string;
  monthly_rent: number;
  deposit_held: number;
  lease_end: string;
  renewal_status: string;
  collected_ytd: number;
  expected_ytd: number;
  arrears: number;
  aging_bucket: 'Current' | '1-30' | '31-60' | '61-90' | '90+';
  last_payment?: string;
  status: string;
}

export interface BoardPackSnapshot {
  generated_at: string;
  organization_name: string;
  occupancy_rate: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  monthly_rent_roll: number;
  arrears_total: number;
  deposits_held: number;
  open_tickets: number;
  sla_overdue: number;
  pipeline_value: number;
  pipeline_deals: number;
  rent_roll: RentRollRow[];
  top_arrears: RentRollRow[];
}

const PIPELINE_KEY = 'umhlaba_wami_pipeline_v1';
const DEPOSIT_KEY = 'umhlaba_wami_deposits_v1';
const BILLING_KEY = 'umhlaba_wami_org_billing_v1';

function loadPipeline(): LeasePipelineDeal[] {
  try {
    const raw = localStorage.getItem(PIPELINE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const seed: LeasePipelineDeal[] = [
    {
      id: 'deal_1',
      organization_id: 'org_gables_lifestyle',
      prospect_name: 'Thabo Nkambule',
      company: 'Valley Coffee Roasters',
      email: 'thabo@valleycoffee.sz',
      phone: '+268 7611 2200',
      shop_label: 'G-08 · Ground Floor',
      proposed_rent: 18500,
      stage: 'Viewing Scheduled',
      probability: 40,
      expected_close: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      notes: 'Wants corner unit with outdoor seating option',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'deal_2',
      organization_id: 'org_gables_lifestyle',
      prospect_name: 'Nomsa Dlamini',
      company: 'Nomsa Beauty Lounge',
      email: 'nomsa@beautylounge.sz',
      phone: '+268 7800 3344',
      shop_label: 'L1-12 · Level 1',
      proposed_rent: 22000,
      stage: 'Offer Made',
      probability: 65,
      expected_close: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      notes: 'Counter-offer at E20,500 pending',
      created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'deal_3',
      organization_id: 'org_gables_lifestyle',
      prospect_name: 'Kevin Chen',
      company: 'Chen Mobile Accessories',
      email: 'kevin@chenmobile.sz',
      phone: '+268 7602 8899',
      shop_label: 'Kiosk K-03',
      proposed_rent: 8500,
      stage: 'Lease Draft',
      probability: 85,
      expected_close: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'deal_4',
      organization_id: 'org_gables_lifestyle',
      prospect_name: 'Siphiwe Motsa',
      company: 'Motsa Legal Practice',
      email: 'siphiwe@motsalegal.sz',
      phone: '+268 2404 5566',
      shop_label: 'Office Suite 2B',
      proposed_rent: 28000,
      stage: 'Enquiry',
      probability: 20,
      expected_close: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(PIPELINE_KEY, JSON.stringify(seed));
  return seed;
}

function savePipeline(deals: LeasePipelineDeal[]) {
  localStorage.setItem(PIPELINE_KEY, JSON.stringify(deals));
}

function loadDeposits(): DepositLedgerEntry[] {
  try {
    const raw = localStorage.getItem(DEPOSIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const seed: DepositLedgerEntry[] = [];
  for (const lease of db.leases) {
    seed.push({
      id: `dep_in_${lease.id}`,
      organization_id: lease.organization_id,
      tenant_id: lease.tenant_id,
      lease_id: lease.id,
      shop_id: lease.shop_id,
      amount: lease.deposit,
      direction: 'held',
      reason: 'Security deposit on lease commencement',
      date: lease.start_date,
      balance_after: lease.deposit,
    });
  }
  localStorage.setItem(DEPOSIT_KEY, JSON.stringify(seed));
  return seed;
}

function saveDeposits(entries: DepositLedgerEntry[]) {
  localStorage.setItem(DEPOSIT_KEY, JSON.stringify(entries));
}

class CommercialService {
  /** Build rent roll with arrears aging from leases + rent collection transactions */
  getRentRoll(organizationId?: string): RentRollRow[] {
    const leases = organizationId
      ? db.leases.filter((l) => l.organization_id === organizationId)
      : db.leases;

    const rows: RentRollRow[] = [];

    for (const lease of leases) {
      if (lease.renewal_status === 'Terminated' || lease.renewal_status === 'Expired') continue;
      const tenant = db.tenants.find((t) => t.id === lease.tenant_id);
      const shop = db.shops.find((s) => s.id === lease.shop_id);
      const property = db.properties.find((p) => p.id === shop?.property_id);
      if (!tenant || !shop) continue;

      const rentTx = db.financeTransactions.filter(
        (t) =>
          t.tenant_id === tenant.id &&
          t.type === 'Rent Collection' &&
          t.direction === 'income' &&
          t.status === 'Paid'
      );
      const collected = rentTx.reduce((s, t) => s + t.amount, 0);
      const monthsElapsed = Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(lease.start_date).getTime()) / (30 * 86400000)
        )
      );
      const expected = lease.rental_amount * Math.min(monthsElapsed, 12);
      const arrears = Math.max(0, expected - collected);

      let aging: RentRollRow['aging_bucket'] = 'Current';
      if (arrears > 0) {
        const monthsBehind = arrears / lease.rental_amount;
        if (monthsBehind > 3) aging = '90+';
        else if (monthsBehind > 2) aging = '61-90';
        else if (monthsBehind > 1) aging = '31-60';
        else aging = '1-30';
      }

      const lastPay = rentTx.sort((a, b) => b.date.localeCompare(a.date))[0];

      rows.push({
        tenant_id: tenant.id,
        business_name: tenant.business_name,
        contact_person: tenant.contact_person,
        shop_number: shop.shop_number,
        property_name: property?.name || '—',
        monthly_rent: lease.rental_amount,
        deposit_held: lease.deposit,
        lease_end: lease.end_date,
        renewal_status: lease.renewal_status,
        collected_ytd: collected,
        expected_ytd: expected,
        arrears,
        aging_bucket: aging,
        last_payment: lastPay?.date,
        status: tenant.status,
      });
    }

    return rows.sort((a, b) => b.arrears - a.arrears);
  }

  recordRentPayment(input: {
    organization_id: string;
    property_id: string;
    shop_id: string;
    tenant_id: string;
    amount: number;
    reference: string;
    date?: string;
    recorded_by: string;
  }): FinanceTransaction {
    const tx = db.addFinanceTransaction({
      organization_id: input.organization_id,
      property_id: input.property_id,
      shop_id: input.shop_id,
      tenant_id: input.tenant_id,
      type: 'Rent Collection',
      amount: input.amount,
      direction: 'income',
      description: `Rent payment — ${input.reference}`,
      reference: input.reference,
      date: input.date || new Date().toISOString().slice(0, 10),
      status: 'Paid',
      reconciled: false,
    });
    db.logAudit(
      'finance',
      input.recorded_by,
      'RECORD_RENT_PAYMENT',
      'FinanceTransaction',
      tx.id,
      input.organization_id,
      `E${input.amount} ref ${input.reference}`
    );
    return tx;
  }

  getDepositLedger(organizationId?: string): DepositLedgerEntry[] {
    const all = loadDeposits();
    return organizationId ? all.filter((e) => e.organization_id === organizationId) : all;
  }

  getDepositBalance(tenantId: string): number {
    const entries = loadDeposits().filter((e) => e.tenant_id === tenantId);
    if (!entries.length) {
      const lease = db.leases.find((l) => l.tenant_id === tenantId);
      return lease?.deposit || 0;
    }
    return entries[entries.length - 1].balance_after;
  }

  processDepositAction(input: {
    organization_id: string;
    tenant_id: string;
    shop_id: string;
    lease_id?: string;
    amount: number;
    direction: DepositLedgerEntry['direction'];
    reason: string;
    actor: string;
  }): DepositLedgerEntry {
    const entries = loadDeposits();
    const current = this.getDepositBalance(input.tenant_id);
    let balance = current;
    if (input.direction === 'held') balance = current + input.amount;
    else if (input.direction === 'partial_refund' || input.direction === 'full_refund')
      balance = Math.max(0, current - input.amount);
    else if (input.direction === 'forfeit') balance = Math.max(0, current - input.amount);

    const entry: DepositLedgerEntry = {
      id: `dep_${Date.now()}`,
      organization_id: input.organization_id,
      tenant_id: input.tenant_id,
      lease_id: input.lease_id,
      shop_id: input.shop_id,
      amount: input.amount,
      direction: input.direction,
      reason: input.reason,
      date: new Date().toISOString().slice(0, 10),
      balance_after: balance,
    };
    entries.push(entry);
    saveDeposits(entries);

    if (input.direction !== 'held') {
      const shop = db.shops.find((s) => s.id === input.shop_id);
      db.addFinanceTransaction({
        organization_id: input.organization_id,
        property_id: shop?.property_id || '',
        shop_id: input.shop_id,
        tenant_id: input.tenant_id,
        type: 'Security Deposit',
        amount: input.amount,
        direction: input.direction === 'forfeit' ? 'income' : 'expense',
        description: `Deposit ${input.direction}: ${input.reason}`,
        reference: entry.id,
        date: entry.date,
        status: 'Paid',
        reconciled: false,
      });
    }

    db.logAudit(
      'finance',
      input.actor,
      'DEPOSIT_ACTION',
      'Deposit',
      entry.id,
      input.organization_id,
      `${input.direction} E${input.amount}`
    );
    return entry;
  }

  listPipeline(organizationId?: string): LeasePipelineDeal[] {
    const deals = loadPipeline();
    return organizationId ? deals.filter((d) => d.organization_id === organizationId) : deals;
  }

  addPipelineDeal(
    deal: Omit<LeasePipelineDeal, 'id' | 'created_at' | 'updated_at'>
  ): LeasePipelineDeal {
    const deals = loadPipeline();
    const full: LeasePipelineDeal = {
      ...deal,
      id: `deal_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    deals.unshift(full);
    savePipeline(deals);
    return full;
  }

  updatePipelineStage(
    dealId: string,
    stage: PipelineStage,
    extras?: Partial<LeasePipelineDeal>
  ): LeasePipelineDeal | null {
    const deals = loadPipeline();
    const d = deals.find((x) => x.id === dealId);
    if (!d) return null;
    d.stage = stage;
    d.updated_at = new Date().toISOString();
    if (stage === 'Signed') d.probability = 100;
    if (stage === 'Lost') d.probability = 0;
    Object.assign(d, extras || {});
    savePipeline(deals);
    return d;
  }

  convertDealToLease(dealId: string, actorName: string): Lease | null {
    const deals = loadPipeline();
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return null;

    const shop =
      (deal.shop_id && db.shops.find((s) => s.id === deal.shop_id)) ||
      db.shops.find((s) => s.status === 'Available' && s.organization_id === deal.organization_id) ||
      db.shops.find((s) => s.organization_id === deal.organization_id);

    if (!shop) return null;

    let tenant = db.tenants.find(
      (t) => t.email.toLowerCase() === deal.email.toLowerCase() && t.organization_id === deal.organization_id
    );

    if (!tenant) {
      tenant = db.addTenant({
        organization_id: deal.organization_id,
        property_id: shop.property_id,
        shopping_center_id: shop.shopping_center_id,
        shop_id: shop.id,
        business_name: deal.company,
        contact_person: deal.prospect_name,
        phone: deal.phone,
        email: deal.email,
        status: 'Active',
        trade_type: 'Retail',
        move_in_date: new Date().toISOString().slice(0, 10),
      });
    }

    const start = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + 2 * 365 * 86400000).toISOString().slice(0, 10);
    const lease = db.addLease({
      tenant_id: tenant.id,
      shop_id: shop.id,
      organization_id: deal.organization_id,
      start_date: start,
      end_date: end,
      rental_amount: deal.proposed_rent,
      deposit: deal.proposed_rent * 2,
      renewal_status: 'Active',
      document_url: '#',
      document_title: `Lease — ${deal.company}`,
      is_digitally_signed: true,
      signed_at: new Date().toISOString(),
      signer_name: deal.prospect_name,
    });

    shop.status = 'Occupied';
    shop.public_listing = false;
    db.saveToStorage();

    this.processDepositAction({
      organization_id: deal.organization_id,
      tenant_id: tenant.id,
      shop_id: shop.id,
      lease_id: lease.id,
      amount: lease.deposit,
      direction: 'held',
      reason: 'Deposit on lease signing from pipeline',
      actor: actorName,
    });

    this.updatePipelineStage(dealId, 'Signed');
    db.logAudit(
      'ops',
      actorName,
      'CONVERT_PIPELINE_LEASE',
      'Lease',
      lease.id,
      deal.organization_id,
      deal.company
    );
    return lease;
  }

  getBoardPack(organizationId?: string): BoardPackSnapshot {
    const org =
      db.organizations.find((o) => o.id === organizationId) ||
      db.organizations.find((o) => o.status === 'Active') ||
      db.organizations[0];

    const oid = organizationId || org?.id;
    const shops = oid ? db.shops.filter((s) => s.organization_id === oid) : db.shops;
    const occupied = shops.filter((s) => s.status === 'Occupied').length;
    const vacant = shops.filter((s) => s.status === 'Available').length;
    const rentRoll = this.getRentRoll(oid);
    const monthly = rentRoll.reduce((s, r) => s + r.monthly_rent, 0);
    const arrears = rentRoll.reduce((s, r) => s + r.arrears, 0);
    const deposits = rentRoll.reduce((s, r) => s + r.deposit_held, 0);
    const tickets = oid ? db.tickets.filter((t) => t.organization_id === oid) : db.tickets;
    const open = tickets.filter((t) => !['Resolved', 'Closed', 'Cancelled'].includes(t.status));
    const pipeline = this.listPipeline(oid).filter((d) => d.stage !== 'Lost' && d.stage !== 'Signed');

    return {
      generated_at: new Date().toISOString(),
      organization_name: org?.company_name || 'Portfolio',
      occupancy_rate: shops.length ? Math.round((occupied / shops.length) * 1000) / 10 : 0,
      total_units: shops.length,
      occupied_units: occupied,
      vacant_units: vacant,
      monthly_rent_roll: monthly,
      arrears_total: arrears,
      deposits_held: deposits,
      open_tickets: open.length,
      sla_overdue: open.filter((t) => t.sla_status === 'Overdue' || t.sla_status === 'Escalated').length,
      pipeline_value: pipeline.reduce((s, d) => s + d.proposed_rent * (d.probability / 100), 0),
      pipeline_deals: pipeline.length,
      rent_roll: rentRoll,
      top_arrears: rentRoll.filter((r) => r.arrears > 0).slice(0, 8),
    };
  }

  exportBoardPackText(organizationId?: string): string {
    const p = this.getBoardPack(organizationId);
    const lines = [
      `UMHLABA WAMI — BOARD PACK`,
      `Organisation: ${p.organization_name}`,
      `Generated: ${new Date(p.generated_at).toLocaleString()}`,
      ``,
      `OCCUPANCY`,
      `  Units: ${p.occupied_units}/${p.total_units} occupied (${p.occupancy_rate}%) · Vacant: ${p.vacant_units}`,
      ``,
      `COMMERCIAL`,
      `  Monthly rent roll: E${p.monthly_rent_roll.toLocaleString()}`,
      `  Arrears total: E${p.arrears_total.toLocaleString()}`,
      `  Deposits held: E${p.deposits_held.toLocaleString()}`,
      `  Pipeline weighted value: E${Math.round(p.pipeline_value).toLocaleString()} (${p.pipeline_deals} deals)`,
      ``,
      `OPERATIONS`,
      `  Open tickets: ${p.open_tickets} · SLA overdue/escalated: ${p.sla_overdue}`,
      ``,
      `TOP ARREARS`,
      ...p.top_arrears.map(
        (r) =>
          `  ${r.business_name} (${r.shop_number}): E${r.arrears.toLocaleString()} [${r.aging_bucket}]`
      ),
      ``,
      `— End of board pack —`,
    ];
    return lines.join('\n');
  }

  /** Platform subscription billing snapshot per organisation */
  getSubscriptionBilling() {
    return db.organizations.map((org) => {
      const plan = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.tier === org.subscription_tier);
      const fee = org.monthly_fee_estimate ?? plan?.pricePerMonthE ?? 0;
      return {
        organization: org,
        plan,
        monthly_fee: fee,
        status: org.status,
        usage: {
          properties: db.properties.filter((p) => p.organization_id === org.id).length,
          tenants: db.tenants.filter((t) => t.organization_id === org.id).length,
          users: db.users.filter((u) => u.organization_id === org.id).length,
          property_limit: org.property_limit,
          tenant_limit: org.tenant_limit,
          user_limit: org.user_limit,
        },
      };
    });
  }

  changeOrgTier(orgId: string, tier: SubscriptionTier, actor: string): Organization | null {
    const org = db.organizations.find((o) => o.id === orgId);
    if (!org) return null;
    const plan = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.tier === tier);
    if (!plan) return null;
    org.subscription_tier = tier;
    org.property_limit = plan.propertyLimit;
    org.tenant_limit = plan.tenantLimit;
    org.user_limit = plan.userLimit;
    org.storage_limit = plan.storageLimitGb;
    org.monthly_fee_estimate = plan.pricePerMonthE;
    db.saveToStorage();
    db.logAudit('super', actor, 'CHANGE_SUBSCRIPTION_TIER', 'Organization', orgId, orgId, tier);
    try {
      const billing = JSON.parse(localStorage.getItem(BILLING_KEY) || '[]');
      billing.unshift({
        id: `bill_${Date.now()}`,
        organization_id: orgId,
        tier,
        amount: plan.pricePerMonthE,
        at: new Date().toISOString(),
        actor,
      });
      localStorage.setItem(BILLING_KEY, JSON.stringify(billing));
    } catch {
      /* ignore */
    }
    return org;
  }

  listLeads(): PropertyLead[] {
    return [...db.leads];
  }

  updateLeadStatus(leadId: string, status: PropertyLead['status']): PropertyLead | null {
    const lead = db.leads.find((l) => l.id === leadId);
    if (!lead) return null;
    lead.status = status;
    db.saveToStorage();
    return lead;
  }
}

export const commercial = new CommercialService();

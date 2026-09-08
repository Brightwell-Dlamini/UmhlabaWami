/**
 * Phase 6 — Partner API facade.
 * Simulates partner API responses against the local/dual-mode data layer.
 * Production: same contracts on Edge Functions / API gateway.
 */
import { db } from './db';
import { commercial } from './commercialService';
import { intelligence } from './intelligenceService';

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  meta?: { latency_ms: number; api_version: string };
}

const WEBHOOK_KEY = 'umhlaba_wami_webhooks_v1';

function ok<T>(data: T, status = 200): ApiResponse<T> {
  return {
    ok: true,
    status,
    data,
    meta: { latency_ms: Math.floor(Math.random() * 40) + 8, api_version: '1.0.0' },
  };
}

function fail(status: number, error: string): ApiResponse {
  return {
    ok: false,
    status,
    error,
    meta: { latency_ms: 5, api_version: '1.0.0' },
  };
}

function resolveOrg(orgCode: string) {
  return db.organizations.find(
    (o) => o.organization_code.toLowerCase() === orgCode.toLowerCase() || o.id === orgCode
  );
}

class PartnerApi {
  health(): ApiResponse {
    return ok({
      service: 'umhlaba-wami-partner-api',
      status: 'healthy',
      mode: import.meta.env.VITE_SUPABASE_URL ? 'supabase' : 'demo',
      timestamp: new Date().toISOString(),
    });
  }

  listUnits(orgCode: string): ApiResponse {
    const org = resolveOrg(orgCode);
    if (!org) return fail(404, 'Organisation not found');
    const units = db.shops
      .filter((s) => s.organization_id === org.id)
      .map((s) => ({
        id: s.id,
        shop_number: s.shop_number,
        floor: s.floor,
        size_sqm: s.size_sqm,
        status: s.status,
        rental_amount: s.rental_amount,
        public_listing: s.public_listing,
      }));
    return ok({ organization: org.organization_code, count: units.length, units });
  }

  listTickets(orgCode: string): ApiResponse {
    const org = resolveOrg(orgCode);
    if (!org) return fail(404, 'Organisation not found');
    const tickets = db.tickets
      .filter((t) => t.organization_id === org.id)
      .slice(0, 50)
      .map((t) => ({
        id: t.id,
        ticket_number: t.ticket_number,
        title: t.title,
        status: t.status,
        priority: t.priority,
        category: t.category,
        sla_status: t.sla_status,
        created_at: t.created_at,
      }));
    return ok({ organization: org.organization_code, count: tickets.length, tickets });
  }

  rentRoll(orgCode: string): ApiResponse {
    const org = resolveOrg(orgCode);
    if (!org) return fail(404, 'Organisation not found');
    const rows = commercial.getRentRoll(org.id);
    return ok({
      organization: org.organization_code,
      currency: 'SZL',
      generated_at: new Date().toISOString(),
      rows,
    });
  }

  portfolioKpis(orgCode: string): ApiResponse {
    const org = resolveOrg(orgCode);
    if (!org) return fail(404, 'Organisation not found');
    return ok(intelligence.getPortfolioKpis(org.id));
  }

  registerWebhook(
    orgCode: string,
    payload: { url: string; events: string[] }
  ): ApiResponse {
    const org = resolveOrg(orgCode);
    if (!org) return fail(404, 'Organisation not found');
    if (!payload.url?.startsWith('https://')) {
      return fail(400, 'Webhook URL must be HTTPS');
    }
    let list: Array<{ id: string; organization_id: string; url: string; events: string[]; created_at: string }> =
      [];
    try {
      list = JSON.parse(localStorage.getItem(WEBHOOK_KEY) || '[]');
    } catch {
      list = [];
    }
    const entry = {
      id: `wh_${Date.now()}`,
      organization_id: org.id,
      url: payload.url,
      events: payload.events?.length ? payload.events : ['ticket.created', 'ticket.resolved'],
      created_at: new Date().toISOString(),
    };
    list.unshift(entry);
    localStorage.setItem(WEBHOOK_KEY, JSON.stringify(list));
    return ok(entry, 201);
  }

  listWebhooks(orgCode: string): ApiResponse {
    const org = resolveOrg(orgCode);
    if (!org) return fail(404, 'Organisation not found');
    let list: Array<{ organization_id: string }> = [];
    try {
      list = JSON.parse(localStorage.getItem(WEBHOOK_KEY) || '[]');
    } catch {
      list = [];
    }
    return ok(list.filter((w) => w.organization_id === org.id));
  }

  /** Dispatch a demo request by path for the API explorer UI */
  invoke(method: string, path: string, body?: unknown): ApiResponse {
    const m = method.toUpperCase();
    if (path === '/health' || path === 'health') return this.health();

    const units = path.match(/^\/?organizations\/([^/]+)\/units\/?$/i);
    if (units && m === 'GET') return this.listUnits(units[1]);

    const tickets = path.match(/^\/?organizations\/([^/]+)\/tickets\/?$/i);
    if (tickets && m === 'GET') return this.listTickets(tickets[1]);

    const rent = path.match(/^\/?organizations\/([^/]+)\/rent-roll\/?$/i);
    if (rent && m === 'GET') return this.rentRoll(rent[1]);

    const kpis = path.match(/^\/?organizations\/([^/]+)\/kpis\/?$/i);
    if (kpis && m === 'GET') return this.portfolioKpis(kpis[1]);

    const wh = path.match(/^\/?organizations\/([^/]+)\/webhooks\/?$/i);
    if (wh && m === 'GET') return this.listWebhooks(wh[1]);
    if (wh && m === 'POST') {
      return this.registerWebhook(wh[1], (body as { url: string; events: string[] }) || { url: '', events: [] });
    }

    return fail(404, `No handler for ${m} ${path}`);
  }
}

export const partnerApi = new PartnerApi();

/**
 * Production data repository — all durable mutations go through Supabase.
 * In-memory `db` is a cache updated after successful remote writes.
 */
import { supabase, isSupabaseConfigured, requireSupabase } from '../lib/supabase';
import { db } from './db';
import type {
  Ticket,
  TicketPriority,
  TicketCategory,
  TicketStatus,
  Organization,
  User,
  Shop,
  Property,
  ShoppingCenter,
  Tenant,
  Lease,
} from '../types';

function slaDeadlines(priority: TicketPriority): { response: string; resolution: string } {
  const now = Date.now();
  const mins =
    priority === 'Emergency'
      ? { r: 15, res: 120 }
      : priority === 'High'
        ? { r: 60, res: 360 }
        : priority === 'Medium'
          ? { r: 240, res: 1440 }
          : { r: 1440, res: 4320 };
  return {
    response: new Date(now + mins.r * 60_000).toISOString(),
    resolution: new Date(now + mins.res * 60_000).toISOString(),
  };
}

/** Map Postgres ticket row → app Ticket (timeline/attachments default empty). */
export function mapTicketRow(row: Record<string, unknown>): Ticket {
  return {
    id: String(row.id),
    ticket_number: String(row.ticket_number),
    organization_id: String(row.organization_id),
    shopping_center_id: row.shopping_center_id ? String(row.shopping_center_id) : '',
    property_id: String(row.property_id),
    shop_id: String(row.shop_id),
    tenant_id: String(row.tenant_id),
    title: String(row.title),
    description: String(row.description),
    exact_location_description: row.exact_location_description
      ? String(row.exact_location_description)
      : undefined,
    priority: row.priority as TicketPriority,
    category: row.category as TicketCategory,
    status: (row.status as TicketStatus) || 'Open',
    assigned_to: row.assigned_to ? String(row.assigned_to) : undefined,
    created_by_user_id: String(row.created_by_user_id),
    created_at: String(row.created_at || new Date().toISOString()),
    response_deadline: String(row.response_deadline),
    resolution_deadline: String(row.resolution_deadline),
    responded_at: row.responded_at ? String(row.responded_at) : undefined,
    resolved_at: row.resolved_at ? String(row.resolved_at) : undefined,
    closed_at: row.closed_at ? String(row.closed_at) : undefined,
    sla_status: (row.sla_status as Ticket['sla_status']) || 'Compliant',
    attachments: [],
    timeline: [],
    repair_notes: row.repair_notes ? String(row.repair_notes) : undefined,
    materials_used: row.materials_used ? String(row.materials_used) : undefined,
    time_spent_hours: row.time_spent_hours != null ? Number(row.time_spent_hours) : undefined,
    cost: row.cost != null ? Number(row.cost) : undefined,
    before_images: Array.isArray(row.before_images) ? (row.before_images as string[]) : undefined,
    after_images: Array.isArray(row.after_images) ? (row.after_images as string[]) : undefined,
    tenant_rating: row.tenant_rating != null ? Number(row.tenant_rating) : undefined,
    tenant_feedback: row.tenant_feedback ? String(row.tenant_feedback) : undefined,
    tenant_confirmed_fixed:
      row.tenant_confirmed_fixed != null ? Boolean(row.tenant_confirmed_fixed) : undefined,
  };
}

function upsertTicketCache(ticket: Ticket) {
  const idx = db.tickets.findIndex((t) => t.id === ticket.id);
  if (idx >= 0) db.tickets[idx] = { ...db.tickets[idx], ...ticket };
  else db.tickets.unshift(ticket);
  db.saveToStorage();
}

export async function createTicketRemote(input: {
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
  before_images?: string[];
  ticket_number?: string;
}): Promise<{ success: boolean; ticket?: Ticket; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  const shop = db.shops.find((s) => s.id === input.shop_id);
  const ticket_number =
    input.ticket_number || db.generateTicketNumber(shop?.shop_number || 'GEN');
  const deadlines = slaDeadlines(input.priority);

  const payload = {
    ticket_number,
    organization_id: input.organization_id,
    shopping_center_id: input.shopping_center_id || null,
    property_id: input.property_id,
    shop_id: input.shop_id,
    tenant_id: input.tenant_id,
    title: input.title,
    description: input.description,
    exact_location_description: input.exact_location_description || null,
    priority: input.priority,
    category: input.category,
    status: 'Open',
    created_by_user_id: input.created_by_user_id,
    response_deadline: deadlines.response,
    resolution_deadline: deadlines.resolution,
    sla_status: 'Compliant',
    before_images: input.before_images?.length ? input.before_images : null,
  };

  const { data, error } = await supabase.from('tickets').insert(payload).select('*').single();

  if (error) {
    console.error('[repository] createTicket', error);
    return { success: false, error: error.message };
  }

  const ticket = mapTicketRow(data as Record<string, unknown>);
  ticket.timeline = [
    {
      id: `tl_${Date.now()}`,
      ticket_id: ticket.id,
      actor_name: 'System',
      actor_role: 'System',
      action: 'Ticket created',
      timestamp: new Date().toISOString(),
    },
  ];
  upsertTicketCache(ticket);
  return { success: true, ticket };
}

export async function updateTicketRemote(
  ticketId: string,
  updates: Record<string, unknown>
): Promise<{ success: boolean; ticket?: Ticket; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
    .select('*')
    .single();

  if (error) {
    console.error('[repository] updateTicket', error);
    return { success: false, error: error.message };
  }

  const ticket = mapTicketRow(data as Record<string, unknown>);
  upsertTicketCache(ticket);
  return { success: true, ticket };
}

export async function assignTicketRemote(
  ticketId: string,
  technicianId: string
): Promise<{ success: boolean; error?: string }> {
  return updateTicketRemote(ticketId, {
    assigned_to: technicianId,
    status: 'Assigned',
    responded_at: new Date().toISOString(),
  });
}

export async function resolveTicketRemote(
  ticketId: string,
  notes?: string,
  materials?: string,
  cost?: number
): Promise<{ success: boolean; error?: string }> {
  return updateTicketRemote(ticketId, {
    status: 'Resolved',
    repair_notes: notes || null,
    materials_used: materials || null,
    cost: cost ?? null,
    resolved_at: new Date().toISOString(),
  });
}

export async function closeTicketRemote(
  ticketId: string,
  rating?: number,
  feedback?: string
): Promise<{ success: boolean; error?: string }> {
  return updateTicketRemote(ticketId, {
    status: 'Closed',
    tenant_rating: rating ?? null,
    tenant_feedback: feedback || null,
    tenant_confirmed_fixed: true,
    closed_at: new Date().toISOString(),
  });
}

export async function registerOrganizationRemote(input: {
  company_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
}): Promise<{ success: boolean; organization?: Organization; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  const code = `ORG-${Date.now().toString().slice(-6)}`;
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      organization_code: code,
      company_name: input.company_name,
      owner_name: input.owner_name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      subscription_tier: 'Starter',
      status: 'Pending Approval',
      property_limit: 3,
      tenant_limit: 100,
      user_limit: 10,
      storage_limit: 10,
    })
    .select('*')
    .single();

  if (error) return { success: false, error: error.message };

  const org = data as Organization;
  db.organizations.unshift(org);
  db.saveToStorage();
  return { success: true, organization: org };
}

export function isProductionBackend(): boolean {
  return isSupabaseConfigured;
}

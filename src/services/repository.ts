/**
 * Production data repository — all durable mutations go through Supabase.
 * In-memory `db` is a cache updated after successful remote writes.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from './db';
import type {
  Ticket,
  TicketPriority,
  TicketCategory,
  TicketStatus,
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

export function mapTicketRow(row: Record<string, unknown>): Ticket {
  return {
    id: String(row.id),
    ticket_number: String(row.ticket_number),
    organization_id: String(row.organization_id),
    shopping_center_id: row.shopping_center_id ? String(row.shopping_center_id) : '',
    property_id: row.property_id ? String(row.property_id) : '',
    shop_id: row.shop_id ? String(row.shop_id) : '',
    tenant_id: row.tenant_id ? String(row.tenant_id) : '',
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
    response_deadline: String(row.response_deadline || new Date().toISOString()),
    resolution_deadline: String(row.resolution_deadline || new Date().toISOString()),
    responded_at: row.responded_at ? String(row.responded_at) : undefined,
    resolved_at: row.resolved_at ? String(row.resolved_at) : undefined,
    closed_at: row.closed_at ? String(row.closed_at) : undefined,
    sla_status: (row.sla_status as Ticket['sla_status']) || 'Compliant',
    attachments: [],
    timeline: [],
    repair_notes: row.repair_notes ? String(row.repair_notes) : undefined,
  };
}

function upsertTicketCache(ticket: Ticket) {
  const idx = db.tickets.findIndex((t) => t.id === ticket.id || t.ticket_number === ticket.ticket_number);
  if (idx >= 0) db.tickets[idx] = ticket;
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
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured' };
  }

  const deadlines = slaDeadlines(input.priority);
  const ticket_number =
    input.ticket_number ||
    `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`;

  const payload: Record<string, unknown> = {
    ticket_number,
    organization_id: input.organization_id,
    shopping_center_id: input.shopping_center_id || null,
    property_id: input.property_id || null,
    shop_id: input.shop_id || null,
    tenant_id: input.tenant_id || null,
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

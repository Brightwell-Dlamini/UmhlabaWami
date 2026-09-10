/**
 * Bridges in-memory db.createTicket → Supabase repository for production durability.
 * Imported once from main.tsx so ticket creates persist even if UI still calls db.createTicket.
 */
import { db } from './db';
import { createTicketRemote } from './repository';
import type { Ticket, TicketPriority, TicketCategory } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

type CreateInput = {
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
  response_deadline?: string;
  resolution_deadline?: string;
  ticket_number?: string;
  before_images?: string[];
};

const original = db.createTicket.bind(db);

db.createTicket = function patchedCreateTicket(data: CreateInput): Ticket {
  // Always create local cache ticket for immediate UI
  const local = original({
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
    created_by_user_id: data.created_by_user_id,
    response_deadline:
      data.response_deadline || new Date(Date.now() + 4 * 3600_000).toISOString(),
    resolution_deadline:
      data.resolution_deadline || new Date(Date.now() + 24 * 3600_000).toISOString(),
    ticket_number: data.ticket_number,
  });

  if (isSupabaseConfigured) {
    void createTicketRemote({
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
      created_by_user_id: data.created_by_user_id,
      before_images: data.before_images,
      ticket_number: local.ticket_number,
    }).then((res) => {
      if (res.success && res.ticket) {
        // Replace temp local id with durable Supabase row
        const idx = db.tickets.findIndex((t) => t.id === local.id);
        if (idx >= 0) {
          db.tickets[idx] = res.ticket;
          db.saveToStorage();
        }
      } else {
        console.error('[dbTicketBridge] remote create failed', res.error);
      }
    });
  }

  return local;
} as typeof db.createTicket;

export {};

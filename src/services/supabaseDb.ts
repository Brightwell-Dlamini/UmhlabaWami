/**
 * Supabase data access helpers (Phase 2).
 * Mirrors the operations needed by the UI while using PostgreSQL + RLS.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Organization,
  Shop,
  Ticket,
  TicketPriority,
  TicketCategory,
  User,
} from '../types';

function requireClient() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase client is not configured.');
  }
  return supabase;
}

export async function fetchAvailableShops(): Promise<Shop[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('shops')
    .select('*')
    .eq('public_listing', true)
    .eq('status', 'Available')
    .order('public_featured', { ascending: false });

  if (error) throw error;
  return (data || []) as Shop[];
}

export async function fetchOrganizations(): Promise<Organization[]> {
  const client = requireClient();
  const { data, error } = await client.from('organizations').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Organization[];
}

export async function fetchTicketsForOrg(organizationId: string): Promise<Ticket[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('tickets')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Ticket[];
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
  response_deadline: string;
  resolution_deadline: string;
  ticket_number: string;
}): Promise<Ticket> {
  const client = requireClient();
  const { data, error } = await client
    .from('tickets')
    .insert({
      ...input,
      status: 'Open',
      sla_status: 'Compliant',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Ticket;
}

export async function approveOrganizationRemote(
  orgId: string,
  approvedBy: string
): Promise<Organization> {
  const client = requireClient();
  const { data, error } = await client
    .from('organizations')
    .update({
      status: 'Active',
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
    })
    .eq('id', orgId)
    .select()
    .single();

  if (error) throw error;
  return data as Organization;
}

export async function logActivityRemote(entry: {
  organization_id?: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: string;
}): Promise<void> {
  const client = requireClient();
  await client.from('activity_logs').insert(entry);
}

export async function uploadAttachment(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const client = requireClient();
  const { error } = await client.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function registerOrganizationRemote(payload: {
  company_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  subscription_tier: string;
  monthly_fee_estimate?: number;
  organization_code: string;
}): Promise<Organization> {
  const client = requireClient();
  const { data, error } = await client
    .from('organizations')
    .insert({
      ...payload,
      status: 'Pending Approval',
      property_limit: payload.subscription_tier === 'Enterprise' ? 999 : payload.subscription_tier === 'Professional' ? 10 : 3,
      tenant_limit: payload.subscription_tier === 'Enterprise' ? 9999 : payload.subscription_tier === 'Professional' ? 500 : 100,
      user_limit: payload.subscription_tier === 'Enterprise' ? 999 : payload.subscription_tier === 'Professional' ? 50 : 10,
      storage_limit: payload.subscription_tier === 'Enterprise' ? 500 : payload.subscription_tier === 'Professional' ? 50 : 10,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Organization;
}

/** Load current app user profile by auth email */
export async function fetchUserByEmail(email: string): Promise<User | null> {
  const client = requireClient();
  const { data, error } = await client.from('users').select('*').eq('email', email).limit(1);
  if (error || !data?.length) return null;
  return data[0] as User;
}

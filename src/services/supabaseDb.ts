/**
 * Supabase data access helpers.
 * hydrateAll() loads remote rows into the in-memory DbService shape.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapTicketRow } from './repository';
import type {
  Organization,
  Shop,
  Ticket,
  TicketPriority,
  TicketCategory,
  User,
  ShoppingCenter,
  Property,
  Tenant,
  Lease,
} from '../types';

function requireClient() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase client is not configured.');
  }
  return supabase;
}

export type RemoteSnapshot = {
  organizations: Organization[];
  users: User[];
  shoppingCenters: ShoppingCenter[];
  properties: Property[];
  shops: Shop[];
  tenants: Tenant[];
  leases: Lease[];
  tickets: Ticket[];
};

export async function hydrateAll(): Promise<RemoteSnapshot> {
  const client = requireClient();
  const [
    organizations,
    users,
    shoppingCenters,
    properties,
    shops,
    tenants,
    leases,
    tickets,
  ] = await Promise.all([
    client.from('organizations').select('*').order('created_at', { ascending: false }),
    client.from('users').select('*').order('created_at', { ascending: true }),
    client.from('shopping_centers').select('*'),
    client.from('properties').select('*'),
    client.from('shops').select('*'),
    client.from('tenants').select('*'),
    client.from('leases').select('*'),
    client.from('tickets').select('*').order('created_at', { ascending: false }),
  ]);

  for (const [name, res] of [
    ['organizations', organizations],
    ['users', users],
    ['shopping_centers', shoppingCenters],
    ['properties', properties],
    ['shops', shops],
    ['tenants', tenants],
    ['leases', leases],
    ['tickets', tickets],
  ] as const) {
    if ((res as { error?: { message: string } }).error) {
      console.warn(
        '[supabaseDb] hydrate partial error on',
        name,
        (res as { error: { message: string } }).error.message
      );
    }
  }

  const mappedLeases = (leases.data || []).map((row: Record<string, unknown>) => ({
    ...row,
    deposit_amount: row.deposit ?? row.deposit_amount,
    status: row.renewal_status ?? row.status ?? 'Active',
  })) as Lease[];

  return {
    organizations: (organizations.data || []) as Organization[],
    users: (users.data || []) as User[],
    shoppingCenters: (shoppingCenters.data || []) as ShoppingCenter[],
    properties: (properties.data || []) as Property[],
    shops: (shops.data || []) as Shop[],
    tenants: (tenants.data || []) as Tenant[],
    leases: mappedLeases,
    tickets: (tickets.data || []).map((row) => mapTicketRow(row as Record<string, unknown>)),
  };
}

export async function hydratePublicListings(): Promise<{
  shops: Shop[];
  properties: Property[];
  shoppingCenters: ShoppingCenter[];
}> {
  const client = requireClient();
  const [shops, properties, shoppingCenters] = await Promise.all([
    client.from('shops').select('*').eq('public_listing', true),
    client.from('properties').select('*'),
    client.from('shopping_centers').select('*'),
  ]);
  if (shops.error) console.warn('[supabaseDb] public shops', shops.error.message);
  if (properties.error) console.warn('[supabaseDb] public properties', properties.error.message);
  if (shoppingCenters.error) console.warn('[supabaseDb] public centers', shoppingCenters.error.message);
  return {
    shops: (shops.data || []) as Shop[],
    properties: (properties.data || []) as Property[],
    shoppingCenters: (shoppingCenters.data || []) as ShoppingCenter[],
  };
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
  return (data || []).map((row) => mapTicketRow(row as Record<string, unknown>));
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

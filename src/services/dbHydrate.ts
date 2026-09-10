/**
 * Supabase hydrate helpers on the singleton `db` instance.
 * Supabase-only mode: no localStorage seed.
 */
import { db } from './db';
import type { Organization, User, ShoppingCenter, Property, Shop, Tenant, Lease, Ticket } from '../types';

type Snapshot = {
  organizations?: Organization[];
  users?: User[];
  shoppingCenters?: ShoppingCenter[];
  properties?: Property[];
  shops?: Shop[];
  tenants?: Tenant[];
  leases?: Lease[];
  tickets?: Ticket[];
};

function applyRemoteSnapshot(snap: Snapshot) {
  if (snap.organizations) db.organizations = snap.organizations;
  if (snap.users) db.users = snap.users;
  if (snap.shoppingCenters) db.shoppingCenters = snap.shoppingCenters;
  if (snap.properties) db.properties = snap.properties;
  if (snap.shops) db.shops = snap.shops;
  if (snap.tenants) db.tenants = snap.tenants;
  if (snap.leases) db.leases = snap.leases;
  if (snap.tickets) db.tickets = snap.tickets;

  const raw = db as unknown as {
    saveToStorage?: () => void;
    notifyListeners?: () => void;
  };
  try {
    raw.saveToStorage?.();
  } catch {
    /* ignore */
  }
  try {
    raw.notifyListeners?.();
  } catch {
    /* ignore */
  }
}

export async function tryHydrateFromSupabase(): Promise<boolean> {
  try {
    const { isSupabaseConfigured } = await import('../lib/supabase');
    if (!isSupabaseConfigured) {
      console.error('[db] Supabase is not configured');
      return false;
    }
    const { hydrateAll } = await import('./supabaseDb');
    const snap = await hydrateAll();
    if (!snap.organizations?.length && !snap.shops?.length) {
      console.warn('[db] Supabase returned empty core tables — run seed-demo-data.sql');
      return false;
    }
    applyRemoteSnapshot(snap);
    console.info('[db] Hydrated from Supabase:', {
      orgs: snap.organizations.length,
      users: snap.users.length,
      shops: snap.shops.length,
      tickets: snap.tickets.length,
    });
    return true;
  } catch (e) {
    console.warn('[db] Supabase hydrate failed', e);
    return false;
  }
}

/** Boot-time public marketplace hydrate (anon-readable public listings). */
export async function tryHydratePublicListings(): Promise<boolean> {
  try {
    const { isSupabaseConfigured } = await import('../lib/supabase');
    if (!isSupabaseConfigured) return false;
    const { hydratePublicListings } = await import('./supabaseDb');
    const snap = await hydratePublicListings();
    if (snap.shops?.length) db.shops = snap.shops;
    if (snap.properties?.length) db.properties = snap.properties;
    if (snap.shoppingCenters?.length) db.shoppingCenters = snap.shoppingCenters;
    const raw = db as unknown as { notifyListeners?: () => void };
    raw.notifyListeners?.();
    return (snap.shops?.length || 0) > 0;
  } catch (e) {
    console.warn('[db] Public listings hydrate failed', e);
    return false;
  }
}

(db as unknown as { tryHydrateFromSupabase: typeof tryHydrateFromSupabase }).tryHydrateFromSupabase =
  tryHydrateFromSupabase;
(db as unknown as { tryHydratePublicListings: typeof tryHydratePublicListings }).tryHydratePublicListings =
  tryHydratePublicListings;

// Boot: load public marketplace without auth
void tryHydratePublicListings();

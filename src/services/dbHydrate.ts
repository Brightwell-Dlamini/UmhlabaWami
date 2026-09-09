/**
 * Attaches Supabase hydrate helpers onto the singleton `db` instance.
 * Keeps the large db.ts seed file intact while enabling remote source-of-truth.
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
  if (snap.organizations?.length) db.organizations = snap.organizations;
  if (snap.users?.length) db.users = snap.users;
  if (snap.shoppingCenters?.length) db.shoppingCenters = snap.shoppingCenters;
  if (snap.properties?.length) db.properties = snap.properties;
  if (snap.shops?.length) db.shops = snap.shops;
  if (snap.tenants?.length) db.tenants = snap.tenants;
  if (snap.leases?.length) db.leases = snap.leases;
  if (snap.tickets?.length) db.tickets = snap.tickets;

  // private methods exist at runtime on the instance
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
    if (!isSupabaseConfigured) return false;
    const { hydrateAll } = await import('./supabaseDb');
    const snap = await hydrateAll();
    if (!snap.organizations?.length && !snap.shops?.length) {
      console.warn('[db] Supabase returned empty core tables — keep local seed.');
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
    console.warn('[db] Supabase hydrate failed — using local seed.', e);
    return false;
  }
}

(db as unknown as { tryHydrateFromSupabase: typeof tryHydrateFromSupabase }).tryHydrateFromSupabase =
  tryHydrateFromSupabase;

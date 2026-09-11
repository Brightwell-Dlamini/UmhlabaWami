/**
 * Portfolio structure: Centres → Properties → Units (Supabase + local db).
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from './db';
import type { ShoppingCenter, Property, Shop, UnitStatus } from '../types';

function client() {
  if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
  return supabase;
}

export async function createCentre(input: {
  organization_id: string;
  name: string;
  address: string;
  location: string;
  description?: string;
  operating_hours?: string;
  parking_bays?: number;
}): Promise<{ success: boolean; centre?: ShoppingCenter; error?: string }> {
  try {
    const row = {
      organization_id: input.organization_id,
      name: input.name.trim(),
      address: input.address.trim(),
      location: input.location.trim(),
      description: input.description || '',
      image: '',
      status: 'Active',
      operating_hours: input.operating_hours || '08:00 – 18:00',
      parking_bays: input.parking_bays ?? 0,
      amenities: [] as string[],
    };
    const { data, error } = await client().from('shopping_centers').insert(row).select('*').single();
    if (error) return { success: false, error: error.message };
    const centre = data as ShoppingCenter;
    db.shoppingCenters.unshift(centre);
    db.saveToStorage();
    return { success: true, centre };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Could not create centre' };
  }
}

export async function createProperty(input: {
  organization_id: string;
  shopping_center_id: string;
  name: string;
  type: Property['type'];
  address?: string;
  description?: string;
}): Promise<{ success: boolean; property?: Property; error?: string }> {
  try {
    const centre = db.shoppingCenters.find((c) => c.id === input.shopping_center_id);
    const row = {
      organization_id: input.organization_id,
      shopping_center_id: input.shopping_center_id,
      name: input.name.trim(),
      type: input.type,
      address: input.address || centre?.address || '',
      description: input.description || '',
      status: 'Active',
    };
    const { data, error } = await client().from('properties').insert(row).select('*').single();
    if (error) return { success: false, error: error.message };
    const property = data as Property;
    db.properties.unshift(property);
    db.saveToStorage();
    return { success: true, property };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Could not create property' };
  }
}

export async function createUnit(input: {
  organization_id: string;
  shopping_center_id: string;
  property_id: string;
  shop_number: string;
  floor: string;
  size_sqm: number;
  rental_amount: number;
  deposit_amount: number;
  status: UnitStatus;
  public_listing: boolean;
  property_type: Property['type'];
  description?: string;
}): Promise<{ success: boolean; shop?: Shop; error?: string }> {
  try {
    const fullRow: Record<string, unknown> = {
      organization_id: input.organization_id,
      shopping_center_id: input.shopping_center_id,
      property_id: input.property_id,
      shop_number: input.shop_number.trim(),
      floor: input.floor,
      size_sqm: input.size_sqm,
      rental_amount: input.rental_amount,
      deposit_amount: input.deposit_amount,
      status: input.status,
      public_listing: input.public_listing,
      public_featured: false,
      qr_code: `UW-${input.shop_number}`,
      images: [],
      features: [],
      property_type: input.property_type,
      description: input.description || '',
    };

    let { data, error } = await client().from('shops').insert(fullRow).select('*').single();

    // Retry without optional columns if schema cache is stale / column missing
    if (error && /property_type|schema cache|column/i.test(error.message)) {
      const minimal = {
        organization_id: input.organization_id,
        shopping_center_id: input.shopping_center_id,
        property_id: input.property_id,
        shop_number: input.shop_number.trim(),
        status: input.status,
        rental_amount: input.rental_amount,
        size_sqm: input.size_sqm,
        description: input.description || '',
      };
      const retry = await client().from('shops').insert(minimal).select('*').single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return { success: false, error: error.message };

    const shop = {
      ...(data as Shop),
      property_type: input.property_type,
      floor: input.floor,
      deposit_amount: input.deposit_amount,
      public_listing: input.public_listing,
    };
    db.shops.unshift(shop);
    db.saveToStorage();
    return { success: true, shop };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Could not create unit' };
  }
}

/**
 * Organisation-scoped durable writes: tenants, announcements, branding.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from './db';
import type { Tenant, Announcement, Organization } from '../types';

function client() {
  if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
  return supabase;
}

export async function createTenantRemote(input: {
  organization_id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  trade_type?: string;
  shopping_center_id?: string;
  shop_id?: string;
  status?: string;
}): Promise<{ success: boolean; tenant?: Tenant; error?: string }> {
  try {
    const row = {
      organization_id: input.organization_id,
      business_name: input.business_name.trim(),
      contact_person: input.contact_person.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone || null,
      trade_type: input.trade_type || null,
      shopping_center_id: input.shopping_center_id || null,
      shop_id: input.shop_id || null,
      status: input.status || 'Active',
    };
    const { data, error } = await client().from('tenants').insert(row).select('*').single();
    if (error) return { success: false, error: error.message };
    const tenant = data as Tenant;
    db.tenants.unshift(tenant);
    db.saveToStorage();
    return { success: true, tenant };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create tenant' };
  }
}

export async function updateTenantRemote(
  id: string,
  updates: Partial<Tenant>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await client().from('tenants').update(updates).eq('id', id);
    if (error) return { success: false, error: error.message };
    const idx = db.tenants.findIndex((t) => t.id === id);
    if (idx >= 0) {
      db.tenants[idx] = { ...db.tenants[idx], ...updates };
      db.saveToStorage();
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Update failed' };
  }
}

export async function createAnnouncementRemote(input: {
  organization_id: string;
  title: string;
  message: string;
  priority: Announcement['priority'];
  target_audience: Announcement['target_audience'];
  created_by_name: string;
  property_id?: string;
}): Promise<{ success: boolean; announcement?: Announcement; error?: string }> {
  try {
    const row = {
      organization_id: input.organization_id,
      property_id: input.property_id || null,
      title: input.title.trim(),
      message: input.message.trim(),
      priority: input.priority,
      target_audience: input.target_audience,
      created_by_name: input.created_by_name,
      is_active: true,
    };
    const { data, error } = await client().from('announcements').insert(row).select('*').single();
    if (error) return { success: false, error: error.message };
    const announcement = data as Announcement;
    db.announcements.unshift(announcement);
    db.saveToStorage();
    return { success: true, announcement };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create announcement' };
  }
}

export async function updateAnnouncementRemote(
  id: string,
  updates: Partial<Announcement>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await client().from('announcements').update(updates).eq('id', id);
    if (error) return { success: false, error: error.message };
    const idx = db.announcements.findIndex((a) => a.id === id);
    if (idx >= 0) {
      db.announcements[idx] = { ...db.announcements[idx], ...updates };
      db.saveToStorage();
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Update failed' };
  }
}

export async function deleteAnnouncementRemote(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await client().from('announcements').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    db.announcements = db.announcements.filter((a) => a.id !== id);
    db.saveToStorage();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Delete failed' };
  }
}

export async function updateOrganizationBranding(input: {
  orgId: string;
  company_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo_url?: string;
  custom_branding_color?: string;
}): Promise<{ success: boolean; organization?: Organization; error?: string }> {
  try {
    const patch: Record<string, unknown> = {};
    if (input.company_name != null) patch.company_name = input.company_name;
    if (input.phone != null) patch.phone = input.phone;
    if (input.email != null) patch.email = input.email;
    if (input.address != null) patch.address = input.address;
    if (input.logo_url != null) patch.logo_url = input.logo_url;
    if (input.custom_branding_color != null) patch.custom_branding_color = input.custom_branding_color;

    const { data, error } = await client()
      .from('organizations')
      .update(patch)
      .eq('id', input.orgId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    const organization = data as Organization;
    const idx = db.organizations.findIndex((o) => o.id === input.orgId);
    if (idx >= 0) db.organizations[idx] = { ...db.organizations[idx], ...organization };
    db.saveToStorage();
    return { success: true, organization };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Branding update failed' };
  }
}

/** Logged-in user changes their own Auth password */
export async function changeOwnPassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { success: false, error: 'Not configured' };
  if (newPassword.length < 8) return { success: false, error: 'Password must be at least 8 characters' };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Admin sets a temporary password by re-creating Auth session pattern (signUp already-exists path limited).
 * Best effort: send password recovery email to the staff member.
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { success: false, error: 'Not configured' };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

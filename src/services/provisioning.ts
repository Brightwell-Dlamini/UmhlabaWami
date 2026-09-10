/**
 * UI-driven provisioning: organisations, staff users, and Auth accounts.
 * Super Admin is the only seed; everything else is created from the product UI.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from './db';
import type { Organization, User, UserRole } from '../types';

export async function submitOrganisationRegistration(input: {
  company_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  subscription_tier?: string;
  monthly_fee_estimate?: number;
}): Promise<{ success: boolean; organization?: Organization; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Service is temporarily unavailable. Please try again later.' };
  }

  const { data, error } = await supabase
    .from('organizations')
    .insert({
      organization_code: `PEND-${Date.now().toString().slice(-8)}`,
      company_name: input.company_name,
      owner_name: input.owner_name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      subscription_tier: input.subscription_tier || 'Starter',
      status: 'Pending Approval',
      property_limit: 3,
      tenant_limit: 100,
      user_limit: 10,
      storage_limit: 10,
      monthly_fee_estimate: input.monthly_fee_estimate ?? null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[provisioning] org register', error);
    return { success: false, error: 'Could not submit registration. Please check your details and try again.' };
  }

  const org = data as Organization;
  db.organizations.unshift(org);
  db.saveToStorage();
  return { success: true, organization: org };
}

export async function approveOrganisation(
  orgId: string,
  opts: { organization_code?: string; approved_by: string }
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Service unavailable.' };
  }

  const code =
    opts.organization_code?.trim() ||
    `ORG-${Date.now().toString().slice(-6)}`;

  const { data, error } = await supabase
    .from('organizations')
    .update({
      status: 'Active',
      organization_code: code,
      approved_at: new Date().toISOString(),
      approved_by: opts.approved_by,
    })
    .eq('id', orgId)
    .select('*')
    .single();

  if (error) return { success: false, error: error.message };

  const org = data as Organization;
  const idx = db.organizations.findIndex((o) => o.id === orgId);
  if (idx >= 0) db.organizations[idx] = org;
  else db.organizations.unshift(org);
  db.saveToStorage();
  return { success: true };
}

/**
 * Create a staff / tenant user from the UI.
 * Creates Auth credentials (signUp) then public.users profile, restoring the admin session.
 */
export async function createStaffUser(input: {
  organization_id: string;
  name: string;
  email: string;
  username: string;
  phone?: string;
  role: UserRole;
  password: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Service unavailable.' };
  }

  if (!input.password || input.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const adminSession = sessionData.session;

  const { error: signUpErr } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        full_name: input.name,
        username: input.username,
        role: input.role,
      },
    },
  });

  if (signUpErr) {
    // User may already exist in Auth — still try profile insert
    console.warn('[provisioning] signUp', signUpErr.message);
  }

  // Restore admin session so we do not stay logged in as the new user
  if (adminSession) {
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      organization_id: input.organization_id,
      username: input.username.trim().toLowerCase(),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone || null,
      role: input.role,
      status: 'Active',
    })
    .select('*')
    .single();

  if (error) {
    return {
      success: false,
      error:
        error.message.includes('duplicate') || error.code === '23505'
          ? 'A user with this email or username already exists.'
          : 'Could not create user profile. Please try again.',
    };
  }

  const user = data as User;
  db.users.push(user);
  db.saveToStorage();
  return { success: true, user };
}

export async function createPropertyCenter(input: {
  organization_id: string;
  name: string;
  address: string;
  location: string;
  description?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Service unavailable.' };
  }

  const { data, error } = await supabase
    .from('shopping_centers')
    .insert({
      organization_id: input.organization_id,
      name: input.name,
      address: input.address,
      location: input.location,
      description: input.description || null,
      status: 'Active',
    })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };

  await db.tryHydrateFromSupabase?.();
  return { success: true, id: data.id as string };
}

export async function createCommercialUnit(input: {
  organization_id: string;
  property_id: string;
  shopping_center_id?: string;
  shop_number: string;
  floor?: string;
  size_sqm?: number;
  monthly_rent?: number;
  status?: string;
  public_listing?: boolean;
  description?: string;
  images?: string[];
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Service unavailable.' };
  }

  const qr = `UW-${input.shop_number}-${Date.now().toString().slice(-4)}`;
  const { error } = await supabase.from('shops').insert({
    organization_id: input.organization_id,
    property_id: input.property_id,
    shopping_center_id: input.shopping_center_id || null,
    shop_number: input.shop_number,
    floor: input.floor || 'Ground',
    size_sqm: input.size_sqm ?? 0,
    monthly_rent: input.monthly_rent ?? 0,
    deposit_amount: (input.monthly_rent ?? 0) * 2,
    status: input.status || 'Available',
    public_listing: input.public_listing ?? false,
    public_featured: false,
    qr_code: qr,
    description: input.description || null,
    images: input.images?.length ? input.images : null,
  });

  if (error) return { success: false, error: error.message };
  await db.tryHydrateFromSupabase?.();
  return { success: true };
}

/** Upload image/document to Storage; returns public URL or data URL fallback. */
export async function uploadUserFile(
  file: File,
  folder: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!file) return { success: false, error: 'No file selected.' };
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'File must be 5MB or smaller.' };
  }

  if (isSupabaseConfigured && supabase) {
    const path = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const bucket = 'property-images';
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return { success: true, url: data.publicUrl };
    }
    // Fall through to data-URL if bucket missing
    console.warn('[upload]', error.message);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ success: true, url: String(reader.result) });
    reader.onerror = () => resolve({ success: false, error: 'Could not read file.' });
    reader.readAsDataURL(file);
  });
}

/**
 * UI-driven provisioning: organisations, staff users (Auth + profile), listing leads.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from './db';
import type { Organization, User, UserRole } from '../types';

function friendlyError(err: { message?: string; code?: string; details?: string; hint?: string } | null): string {
  if (!err) return 'Something went wrong. Please try again.';
  const m = `${err.message || ''} ${err.details || ''} ${err.hint || ''}`;
  if (m.includes('duplicate') || err.code === '23505') return 'This email or organisation is already registered.';
  if (m.includes('row-level security') || m.includes('RLS') || m.toLowerCase().includes('permission denied')) {
    return 'Permission denied while saving. Please run public/fix-org-registration.sql in the Supabase SQL Editor, then try again.';
  }
  if (m.includes('Failed to fetch') || m.includes('Network')) {
    return 'Network error. Check your connection and try again.';
  }
  if (m.includes('Could not find the function') || m.includes('register_organization_application')) {
    return 'Registration function missing. Run public/fix-org-registration.sql in Supabase, then try again.';
  }
  return err.message || 'Could not complete this action. Please try again.';
}

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

  // Preferred: SECURITY DEFINER RPC (works with strict RLS)
  const { data: rpcData, error: rpcError } = await supabase.rpc('register_organization_application', {
    p_company_name: input.company_name,
    p_owner_name: input.owner_name,
    p_email: input.email.toLowerCase().trim(),
    p_phone: input.phone,
    p_address: input.address,
    p_subscription_tier: input.subscription_tier || 'Starter',
    p_monthly_fee_estimate: input.monthly_fee_estimate ?? null,
  });

  if (!rpcError && rpcData) {
    const org = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as Organization;
    db.organizations.unshift(org);
    db.saveToStorage();
    return { success: true, organization: org };
  }

  // Fallback: direct insert (needs INSERT policy)
  if (rpcError) {
    console.warn('[provisioning] RPC failed, trying direct insert', rpcError.message);
  }

  const code = `PEND-${Date.now().toString(36).toUpperCase().slice(-8)}`;
  const row = {
    organization_code: code,
    company_name: input.company_name,
    owner_name: input.owner_name,
    email: input.email.toLowerCase().trim(),
    phone: input.phone,
    address: input.address,
    subscription_tier: input.subscription_tier || 'Starter',
    status: 'Pending Approval',
    property_limit: 3,
    tenant_limit: 100,
    user_limit: 10,
    storage_limit: 10,
    monthly_fee_estimate: input.monthly_fee_estimate ?? null,
  };

  const { data, error } = await supabase.from('organizations').insert(row).select('*').single();

  if (error) {
    console.error('[provisioning] org register', error);
    // Prefer RPC error message if it was "function missing", else insert error
    if (rpcError && (rpcError.message || '').includes('Could not find the function')) {
      return { success: false, error: friendlyError(rpcError) };
    }
    return { success: false, error: friendlyError(error) };
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

  const code = opts.organization_code?.trim() || `ORG-${Date.now().toString().slice(-6)}`;

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

  if (error) return { success: false, error: friendlyError(error) };

  const org = data as Organization;
  const idx = db.organizations.findIndex((o) => o.id === orgId);
  if (idx >= 0) db.organizations[idx] = org;
  else db.organizations.unshift(org);
  db.saveToStorage();
  return { success: true };
}

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

  const email = input.email.trim().toLowerCase();
  const { data: sessionData } = await supabase.auth.getSession();
  const adminSession = sessionData.session;

  const { error: signUpErr } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        full_name: input.name,
        username: input.username,
        role: input.role,
      },
    },
  });

  if (signUpErr && !signUpErr.message.toLowerCase().includes('already')) {
    console.warn('[provisioning] signUp', signUpErr.message);
  }

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
      email,
      phone: input.phone || null,
      role: input.role,
      status: 'Active',
    })
    .select('*')
    .single();

  if (error) return { success: false, error: friendlyError(error) };

  const user = data as User;
  db.users.push(user);
  db.saveToStorage();
  return { success: true, user };
}

export async function submitListingLead(input: {
  property_name: string;
  property_type: string;
  location: string;
  total_units?: string;
  owner_name: string;
  phone: string;
  email: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Service unavailable.' };
  }

  const { error } = await supabase.from('listing_leads').insert({
    property_name: input.property_name,
    property_type: input.property_type,
    location: input.location,
    total_units: input.total_units || null,
    owner_name: input.owner_name,
    phone: input.phone,
    email: input.email.toLowerCase(),
    notes: input.notes || null,
    status: 'New',
  });

  if (error) {
    console.warn('[provisioning] listing lead', error.message);
    return { success: false, error: friendlyError(error) };
  }
  return { success: true };
}

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
    const { error } = await supabase.storage.from('property-images').upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (!error) {
      const { data } = supabase.storage.from('property-images').getPublicUrl(path);
      return { success: true, url: data.publicUrl };
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ success: true, url: String(reader.result) });
    reader.onerror = () => resolve({ success: false, error: 'Could not read file.' });
    reader.readAsDataURL(file);
  });
}

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
    return 'Permission denied while saving. Run public/fix-approval-and-register.sql in Supabase, then try again.';
  }
  if (m.includes('Failed to fetch') || m.includes('Network')) {
    return 'Network error. Check your connection and try again.';
  }
  if (m.includes('Could not find the function')) {
    return 'Database function missing. Run public/fix-approval-and-register.sql in the Supabase SQL Editor.';
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
  preferred_username?: string;
  password?: string;
  registration_notes?: string;
}): Promise<{ success: boolean; organization?: Organization; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Service is temporarily unavailable. Please try again later.' };
  }

  const email = input.email.toLowerCase().trim();
  const username = (input.preferred_username || email.split('@')[0]).toLowerCase().trim();

  // 1) Create Auth account so the owner can sign in after approval (password never stored in our tables)
  if (input.password && input.password.length >= 8) {
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          full_name: input.owner_name,
          username,
          role: 'admin',
        },
      },
    });
    if (signUpErr && !signUpErr.message.toLowerCase().includes('already')) {
      console.warn('[provisioning] owner signUp', signUpErr.message);
      // Continue — org row is still needed; Auth may already exist
    }
    // Sign out so visitor is not left as the new user
    await supabase.auth.signOut();
  }

  // 2) Organisation application via SECURITY DEFINER RPC
  const { data: rpcData, error: rpcError } = await supabase.rpc('register_organization_application', {
    p_company_name: input.company_name,
    p_owner_name: input.owner_name,
    p_email: email,
    p_phone: input.phone,
    p_address: input.address,
    p_subscription_tier: input.subscription_tier || 'Starter',
    p_monthly_fee_estimate: input.monthly_fee_estimate ?? null,
    p_preferred_username: username,
    p_registration_notes: input.registration_notes || null,
  });

  if (rpcError) {
    // Fallback: direct insert
    console.warn('[provisioning] register RPC', rpcError.message);
    const code = `PEND-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        organization_code: code,
        company_name: input.company_name,
        owner_name: input.owner_name,
        email,
        phone: input.phone,
        address: input.address,
        subscription_tier: input.subscription_tier || 'Starter',
        status: 'Pending Approval',
        property_limit: 3,
        tenant_limit: 100,
        user_limit: 10,
        storage_limit: 10,
        monthly_fee_estimate: input.monthly_fee_estimate ?? null,
        preferred_username: username,
        registration_notes: input.registration_notes || null,
      })
      .select('*')
      .single();

    if (error) return { success: false, error: friendlyError(error) };
    const org = data as Organization;
    db.organizations.unshift(org);
    db.saveToStorage();
    return { success: true, organization: org };
  }

  const org = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as Organization;
  db.organizations.unshift(org);
  db.saveToStorage();
  return { success: true, organization: org };
}

export async function approveOrganisation(
  orgId: string,
  opts: { organization_code?: string; approved_by: string }
): Promise<{ success: boolean; organization?: Organization; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Service unavailable.' };
  }

  const code = opts.organization_code?.trim() || `ORG-${Date.now().toString().slice(-6)}`;

  // Prefer SECURITY DEFINER RPC
  const { data: rpcData, error: rpcError } = await supabase.rpc('approve_organization_application', {
    p_org_id: orgId,
    p_organization_code: code,
    p_approved_by: opts.approved_by,
  });

  let org: Organization | null = null;

  if (!rpcError && rpcData) {
    org = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as Organization;
  } else {
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

    if (error) return { success: false, error: friendlyError(rpcError || error) };
    org = data as Organization;
  }

  if (!org) return { success: false, error: 'Approval failed.' };

  // Bootstrap organisation admin in public.users (Auth account already created at registration)
  const username =
    (org as Organization & { preferred_username?: string }).preferred_username ||
    org.email.split('@')[0];

  const { data: existing } = await supabase.from('users').select('id').eq('email', org.email).maybeSingle();

  if (!existing) {
    const { error: userErr } = await supabase.from('users').insert({
      organization_id: org.id,
      username: String(username).toLowerCase(),
      name: org.owner_name,
      email: org.email,
      phone: org.phone,
      role: 'admin',
      status: 'Active',
    });
    if (userErr) console.warn('[provisioning] admin user bootstrap', userErr.message);
  } else {
    await supabase
      .from('users')
      .update({
        organization_id: org.id,
        role: 'admin',
        status: 'Active',
        username: String(username).toLowerCase(),
      })
      .eq('email', org.email);
  }

  const idx = db.organizations.findIndex((o) => o.id === orgId);
  if (idx >= 0) db.organizations[idx] = org;
  else db.organizations.unshift(org);
  db.saveToStorage();
  await db.tryHydrateFromSupabase?.();

  return { success: true, organization: org };
}

export async function rejectOrganisation(
  orgId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Service unavailable.' };
  }

  const { error: rpcError } = await supabase.rpc('reject_organization_application', {
    p_org_id: orgId,
    p_reason: reason,
  });

  if (rpcError) {
    const { error } = await supabase
      .from('organizations')
      .update({ status: 'Rejected' })
      .eq('id', orgId);
    if (error) return { success: false, error: friendlyError(error) };
  }

  const idx = db.organizations.findIndex((o) => o.id === orgId);
  if (idx >= 0) db.organizations[idx] = { ...db.organizations[idx], status: 'Rejected' };
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

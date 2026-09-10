/**
 * UI-driven provisioning: organisations, staff users (Auth + profile), listing leads.
 * Every login-capable user MUST have Auth + public.users.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from './db';
import type { Organization, User, UserRole } from '../types';

function friendlyError(err: { message?: string; code?: string; details?: string; hint?: string } | null): string {
  if (!err) return 'Something went wrong. Please try again.';
  const m = `${err.message || ''} ${err.details || ''} ${err.hint || ''}`;
  if (m.includes('duplicate') || err.code === '23505') return 'This email or organisation is already registered.';
  if (m.includes('row-level security') || m.includes('RLS') || m.toLowerCase().includes('permission denied')) {
    return 'Permission denied while saving. Run public/fix-org-admin-login.sql in Supabase, then try again.';
  }
  if (m.includes('Failed to fetch') || m.includes('Network')) {
    return 'Network error. Check your connection and try again.';
  }
  if (m.includes('Could not find the function')) {
    return 'Database function missing. Run public/fix-org-admin-login.sql in the Supabase SQL Editor.';
  }
  return err.message || 'Could not complete this action. Please try again.';
}

async function bootstrapAdminProfile(input: {
  orgId: string;
  authUserId?: string | null;
  username: string;
  name: string;
  email: string;
  phone?: string;
  status: 'Pending' | 'Active';
}): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'No client' };

  const { error: rpcErr } = await supabase.rpc('bootstrap_org_admin_user', {
    p_org_id: input.orgId,
    p_auth_user_id: input.authUserId || null,
    p_username: input.username,
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone || null,
    p_status: input.status,
  });

  if (!rpcErr) return { success: true };

  const row: Record<string, unknown> = {
    organization_id: input.orgId,
    username: input.username,
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    role: 'admin',
    status: input.status,
  };
  if (input.authUserId) row.id = input.authUserId;

  const { error } = await supabase.from('users').upsert(row, { onConflict: 'id' });
  if (error) {
    const { error: e2 } = await supabase.from('users').insert({
      organization_id: input.orgId,
      username: input.username,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      role: 'admin',
      status: input.status,
    });
    if (e2) return { success: false, error: friendlyError(e2) };
  }
  return { success: true };
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
  const password = input.password || '';

  if (password.length < 8) {
    return { success: false, error: 'Portal password must be at least 8 characters.' };
  }

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: input.owner_name, username, role: 'admin' },
    },
  });

  if (signUpErr && !signUpErr.message.toLowerCase().includes('already registered')) {
    if (!signUpErr.message.toLowerCase().includes('already')) {
      return {
        success: false,
        error: `Could not create login account: ${signUpErr.message}. Disable email confirmation in Supabase Auth for testing if needed.`,
      };
    }
  }

  let authUserId = signUpData.user?.id || null;
  if (!authUserId) {
    const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
    authUserId = signInData.user?.id || null;
  }

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

  let org: Organization | null = null;

  if (!rpcError && rpcData) {
    org = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as Organization;
  } else {
    const code = `PEND-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
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
    if (error) {
      await supabase.auth.signOut();
      return { success: false, error: friendlyError(rpcError || error) };
    }
    org = data as Organization;
  }

  if (!org) {
    await supabase.auth.signOut();
    return { success: false, error: 'Organisation could not be created.' };
  }

  const profile = await bootstrapAdminProfile({
    orgId: org.id,
    authUserId,
    username,
    name: input.owner_name,
    email,
    phone: input.phone,
    status: 'Pending',
  });

  if (!profile.success) console.warn('[provisioning] profile bootstrap failed', profile.error);

  await supabase.auth.signOut();
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

  const code =
    opts.organization_code?.trim() ||
    `ORG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

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

  const username =
    (org as Organization & { preferred_username?: string }).preferred_username ||
    org.email.split('@')[0];

  const boot = await bootstrapAdminProfile({
    orgId: org.id,
    username: String(username).toLowerCase(),
    name: org.owner_name,
    email: org.email,
    phone: org.phone,
    status: 'Active',
  });
  if (!boot.success) console.warn('[provisioning] approve profile', boot.error);

  await supabase
    .from('users')
    .update({ status: 'Active', organization_id: org.id, role: 'admin' })
    .eq('email', org.email);

  const idx = db.organizations.findIndex((o) => o.id === orgId);
  if (idx >= 0) db.organizations[idx] = org;
  else db.organizations.unshift(org);
  db.saveToStorage();
  await db.tryHydrateFromSupabase?.();

  return { success: true, organization: org };
}

export async function provisionOrgAdminLogin(input: {
  orgId: string;
  password: string;
  username?: string;
}): Promise<{ success: boolean; error?: string; username?: string; email?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Service unavailable.' };
  }
  if (!input.password || input.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }

  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', input.orgId)
    .single();

  if (orgErr || !org) return { success: false, error: 'Organisation not found.' };

  const email = String(org.email).toLowerCase();
  const username = (input.username || org.preferred_username || email.split('@')[0])
    .toLowerCase()
    .trim();

  const { data: sessionData } = await supabase.auth.getSession();
  const adminSession = sessionData.session;

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: { data: { full_name: org.owner_name, username, role: 'admin' } },
  });

  if (signUpErr && !signUpErr.message.toLowerCase().includes('already')) {
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }
    return {
      success: false,
      error: `Auth: ${signUpErr.message}. If email exists under Authentication → Users, set password there, then Provision again for the profile.`,
    };
  }

  const authUserId = signUpData.user?.id || null;

  if (adminSession) {
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
  }

  await supabase
    .from('organizations')
    .update({
      preferred_username: username,
      status: org.status === 'Pending Approval' ? org.status : 'Active',
    })
    .eq('id', input.orgId);

  const boot = await bootstrapAdminProfile({
    orgId: input.orgId,
    authUserId,
    username,
    name: org.owner_name,
    email,
    phone: org.phone,
    status: 'Active',
  });

  if (!boot.success) return { success: false, error: boot.error };
  await db.tryHydrateFromSupabase?.();
  return { success: true, username, email };
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
    const { error } = await supabase.from('organizations').update({ status: 'Rejected' }).eq('id', orgId);
    if (error) return { success: false, error: friendlyError(error) };
  }

  const idx = db.organizations.findIndex((o) => o.id === orgId);
  if (idx >= 0) db.organizations[idx] = { ...db.organizations[idx], status: 'Rejected' };
  db.saveToStorage();
  return { success: true };
}

/**
 * Create any staff/tenant login: Auth account + public.users via SECURITY DEFINER RPC.
 * Same path for property_manager, finance, maintenance, tenant, admin.
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

  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  const { data: sessionData } = await supabase.auth.getSession();
  const adminSession = sessionData.session;

  // 1) Auth user with password
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        full_name: input.name,
        username,
        role: input.role,
      },
    },
  });

  if (signUpErr && !signUpErr.message.toLowerCase().includes('already')) {
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }
    return {
      success: false,
      error: `Could not create Auth login: ${signUpErr.message}. Disable email confirmation if testing.`,
    };
  }

  const authUserId = signUpData?.user?.id || null;

  // 2) Restore creator session (Admin / Super Admin must stay logged in)
  if (adminSession) {
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
  }

  // 3) public.users via SECURITY DEFINER (avoids RLS traps)
  const { data: rpcUser, error: rpcErr } = await supabase.rpc('bootstrap_staff_user', {
    p_org_id: input.organization_id,
    p_auth_user_id: authUserId,
    p_username: username,
    p_name: input.name.trim(),
    p_email: email,
    p_phone: input.phone || null,
    p_role: input.role,
    p_status: 'Active',
  });

  let user: User | null = null;

  if (!rpcErr && rpcUser) {
    user = (Array.isArray(rpcUser) ? rpcUser[0] : rpcUser) as User;
  } else {
    const row: Record<string, unknown> = {
      organization_id: input.organization_id,
      username,
      name: input.name.trim(),
      email,
      phone: input.phone || null,
      role: input.role,
      status: 'Active',
    };
    if (authUserId) row.id = authUserId;

    const { data, error } = await supabase.from('users').insert(row).select('*').single();
    if (error) {
      const { data: d2, error: e2 } = await supabase
        .from('users')
        .insert({
          organization_id: input.organization_id,
          username,
          name: input.name.trim(),
          email,
          phone: input.phone || null,
          role: input.role,
          status: 'Active',
        })
        .select('*')
        .single();
      if (e2) return { success: false, error: friendlyError(rpcErr || e2) };
      user = d2 as User;
    } else {
      user = data as User;
    }
  }

  if (!user) return { success: false, error: 'Profile was not created.' };

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

  if (error) return { success: false, error: friendlyError(error) };
  return { success: true };
}

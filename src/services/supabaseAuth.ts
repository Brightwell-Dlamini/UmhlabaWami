/**
 * Supabase-backed authentication.
 * Organisation Code + Username → resolve_login RPC → Auth password sign-in.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Organization, UserRole } from '../types';

export interface SupabaseLoginResult {
  success: boolean;
  error?: string;
  user?: User;
  organization?: Organization | null;
}

function mapDbUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    organization_id: row.organization_id ? String(row.organization_id) : undefined,
    username: String(row.username),
    name: String(row.name),
    email: String(row.email),
    phone: row.phone ? String(row.phone) : undefined,
    role: row.role as UserRole,
    property_id: row.property_id ? String(row.property_id) : undefined,
    shopping_center_id: row.shopping_center_id ? String(row.shopping_center_id) : undefined,
    shop_id: row.shop_id ? String(row.shop_id) : undefined,
    status: (row.status as User['status']) || 'Active',
    avatar_url: row.avatar_url ? String(row.avatar_url) : undefined,
    created_at: String(row.created_at || new Date().toISOString()),
  };
}

function mapDbOrg(row: Record<string, unknown>): Organization {
  return {
    id: String(row.id),
    organization_code: String(row.organization_code),
    company_name: String(row.company_name),
    owner_name: String(row.owner_name),
    email: String(row.email),
    phone: String(row.phone),
    address: String(row.address),
    subscription_tier: row.subscription_tier as Organization['subscription_tier'],
    status: row.status as Organization['status'],
    property_limit: Number(row.property_limit),
    tenant_limit: Number(row.tenant_limit),
    user_limit: Number(row.user_limit),
    storage_limit: Number(row.storage_limit),
    monthly_fee_estimate:
      row.monthly_fee_estimate != null ? Number(row.monthly_fee_estimate) : undefined,
    created_at: String(row.created_at || new Date().toISOString()),
    approved_at: row.approved_at ? String(row.approved_at) : undefined,
    approved_by: row.approved_by ? String(row.approved_by) : undefined,
    logo_url: row.logo_url ? String(row.logo_url) : undefined,
  };
}

async function loadUserByEmail(email: string): Promise<User | null> {
  if (!supabase) return null;
  const { data: rows } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .limit(1);
  if (!rows?.length) return null;
  return mapDbUser(rows[0] as Record<string, unknown>);
}

async function loadOrgById(orgId?: string): Promise<Organization | null> {
  if (!supabase || !orgId) return null;
  const { data: rows } = await supabase.from('organizations').select('*').eq('id', orgId).limit(1);
  if (!rows?.length) return null;
  return mapDbOrg(rows[0] as Record<string, unknown>);
}

export async function supabaseLogin(
  organizationCode: string,
  username: string,
  password: string
): Promise<SupabaseLoginResult> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  const trimmedOrg = organizationCode.trim().toUpperCase();
  const trimmedUser = username.trim().toLowerCase();

  const { data: resolved, error: rpcErr } = await supabase.rpc('resolve_login', {
    p_org_code: trimmedOrg,
    p_username: trimmedUser,
  });

  if (rpcErr) {
    return {
      success: false,
      error: `Login resolver failed: ${rpcErr.message}. Run public/fix-resolve-login.sql in the Supabase SQL Editor, then try again.`,
    };
  }

  const row = Array.isArray(resolved) ? resolved[0] : resolved;
  if (!row || !row.email) {
    return {
      success: false,
      error: `User "${username}" not found for organisation code "${trimmedOrg}".`,
    };
  }

  if (row.organization_status === 'Pending Approval') {
    return {
      success: false,
      error: `Organisation "${row.company_name}" is currently Pending Approval from the Super Admin.`,
    };
  }

  if (row.organization_status === 'Suspended' || row.organization_status === 'Rejected') {
    return {
      success: false,
      error: `Organisation account is inactive (${row.organization_status}). Please contact support.`,
    };
  }

  if (row.user_status && row.user_status !== 'Active') {
    return { success: false, error: `User account is currently ${row.user_status}.` };
  }

  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: String(row.email),
    password,
  });

  if (signInErr) {
    return {
      success: false,
      error:
        signInErr.message ||
        'Invalid password. Check Authentication → Users for this email, or reset the password.',
    };
  }

  const appUser = await loadUserByEmail(String(row.email));
  if (!appUser) {
    return {
      success: false,
      error: 'Auth succeeded but public.users profile was not found for this email.',
    };
  }

  const organization = await loadOrgById(appUser.organization_id);

  return { success: true, user: appUser, organization };
}

export async function supabaseLogout(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getSessionUser(): Promise<User | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  const email = data.session?.user?.email;
  if (!email) return null;
  return loadUserByEmail(email);
}

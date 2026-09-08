/**
 * Supabase-backed authentication (Phase 2).
 * Preserves Organisation Code + Username login UX while using real Auth sessions.
 *
 * Login strategy:
 * 1. Look up organisation by organization_code
 * 2. Look up app user by username within that org
 * 3. Sign in with the user's email via Supabase Auth (password)
 * 4. Session is managed by Supabase; profile is loaded from public.users
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
    monthly_fee_estimate: row.monthly_fee_estimate != null ? Number(row.monthly_fee_estimate) : undefined,
    created_at: String(row.created_at || new Date().toISOString()),
    approved_at: row.approved_at ? String(row.approved_at) : undefined,
    approved_by: row.approved_by ? String(row.approved_by) : undefined,
    logo_url: row.logo_url ? String(row.logo_url) : undefined,
  };
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

  // Super admin path: org code SUPER/ADMIN or username superadmin
  if (trimmedUser === 'superadmin' || trimmedOrg === 'SUPER' || trimmedOrg === 'ADMIN') {
    const { data: saRows, error: saErr } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'super_admin')
      .eq('status', 'Active')
      .limit(1);

    if (saErr || !saRows?.length) {
      return { success: false, error: 'Super Admin account not found in database.' };
    }

    const sa = mapDbUser(saRows[0]);
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: sa.email,
      password,
    });

    if (authErr) {
      return {
        success: false,
        error: authErr.message || 'Invalid Super Admin credentials.',
      };
    }

    return { success: true, user: sa, organization: null };
  }

  // Resolve organisation
  const { data: orgRows, error: orgErr } = await supabase
    .from('organizations')
    .select('*')
    .ilike('organization_code', trimmedOrg)
    .limit(1);

  if (orgErr || !orgRows?.length) {
    return {
      success: false,
      error: `Invalid Organisation Code "${trimmedOrg}". Please verify with your property administration.`,
    };
  }

  const org = mapDbOrg(orgRows[0]);

  if (org.status === 'Pending Approval') {
    return {
      success: false,
      error: `Organisation "${org.company_name}" is currently Pending Approval from the Super Admin.`,
    };
  }

  if (org.status === 'Suspended' || org.status === 'Rejected') {
    return {
      success: false,
      error: `Organisation account is inactive (${org.status}). Please contact support.`,
    };
  }

  // Resolve user within organisation
  const { data: userRows, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', org.id)
    .or(`username.ilike.${trimmedUser},email.ilike.${trimmedUser}`)
    .limit(1);

  if (userErr || !userRows?.length) {
    return {
      success: false,
      error: `User "${username}" not found in organisation ${org.company_name}.`,
    };
  }

  const appUser = mapDbUser(userRows[0]);

  if (appUser.status !== 'Active') {
    return {
      success: false,
      error: `User account is currently ${appUser.status}.`,
    };
  }

  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: appUser.email,
    password,
  });

  if (signInErr) {
    return {
      success: false,
      error: signInErr.message || 'Invalid password.',
    };
  }

  return { success: true, user: appUser, organization: org };
}

export async function supabaseLogout(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getSessionUser(): Promise<User | null> {
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.user?.email) return null;

  const { data: rows } = await supabase
    .from('users')
    .select('*')
    .eq('email', session.user.email)
    .limit(1);

  if (!rows?.length) return null;
  return mapDbUser(rows[0]);
}

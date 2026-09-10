import { User, UserRole, Organization } from '../types';
import { db } from './db';
import { isSupabaseConfigured, getBackendMode } from '../lib/supabase';
import { supabaseLogin, supabaseLogout, getSessionUser } from './supabaseAuth';

const AUTH_STORAGE_KEY = 'umhlaba_wami_current_user_id';

class AuthService {
  private currentUser: User | null = null;
  private currentOrg: Organization | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();
  private sessionReady: Promise<void>;

  constructor() {
    this.sessionReady = this.restoreSession();
  }

  public whenReady(): Promise<void> {
    return this.sessionReady;
  }

  public getBackendMode() {
    return getBackendMode();
  }

  public subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentUser));
  }

  private async hydrateFromRemote(): Promise<void> {
    try {
      const ok = await db.tryHydrateFromSupabase?.();
      if (ok) console.info('[auth] Hydrated application state from Supabase');
      else console.warn('[auth] Hydrate returned no core rows — check seed SQL and RLS');
    } catch (e) {
      console.warn('[auth] Post-login hydrate failed', e);
    }
  }

  private async restoreSession() {
    try {
      if (!isSupabaseConfigured) {
        console.error('[auth] Supabase not configured');
        return;
      }
      const user = await getSessionUser();
      if (user) {
        this.currentUser = user;
        this.currentOrg = null;
        localStorage.setItem(AUTH_STORAGE_KEY, user.id);
        await this.hydrateFromRemote();
        this.notify();
      }
    } catch (e) {
      console.warn('Could not restore auth session', e);
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getCurrentOrganization(): Organization | null {
    if (!this.currentUser) return null;
    if (!this.currentUser.organization_id) return null;
    if (this.currentOrg) return this.currentOrg;
    return db.organizations.find((o) => o.id === this.currentUser?.organization_id) || null;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public login(
    _organizationCode: string,
    _username: string,
    _password?: string
  ): { success: boolean; error?: string; user?: User } {
    return {
      success: false,
      error: 'Synchronous demo login removed. Use loginAsync with Supabase credentials.',
    };
  }

  public async loginAsync(
    organizationCode: string,
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      };
    }

    const result = await supabaseLogin(organizationCode, username, password);
    if (result.success && result.user) {
      this.currentUser = result.user;
      this.currentOrg = result.organization || null;
      localStorage.setItem(AUTH_STORAGE_KEY, result.user.id);
      await this.hydrateFromRemote();
      this.notify();
      return { success: true, user: result.user };
    }

    return { success: false, error: result.error || 'Login failed' };
  }

  public async logout() {
    try {
      await supabaseLogout();
    } catch {
      /* ignore */
    }
    this.currentUser = null;
    this.currentOrg = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    db.resetToDefaults();
    this.notify();
  }

  public switchDemoUser(_role: UserRole) {
    console.warn('[auth] Role switcher disabled. Sign out and log in as the target user.');
  }

  public switchUserById(_userId: string) {
    console.warn('[auth] switchUserById disabled in Supabase-only mode.');
  }

  public canCreateTicket(user: User | null): boolean {
    if (!user) return false;
    return ['tenant', 'property_manager', 'admin', 'super_admin'].includes(user.role);
  }

  public canAssignTicket(user: User | null): boolean {
    if (!user) return false;
    return ['property_manager', 'admin', 'super_admin'].includes(user.role);
  }

  public canManageProperties(user: User | null): boolean {
    if (!user) return false;
    return ['property_manager', 'admin', 'super_admin'].includes(user.role);
  }

  public canManageUsers(user: User | null): boolean {
    if (!user) return false;
    return ['admin', 'super_admin'].includes(user.role);
  }

  public canAccessFinancials(user: User | null): boolean {
    if (!user) return false;
    return ['property_manager', 'finance', 'admin', 'super_admin'].includes(user.role);
  }

  public canApproveOrganizations(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'super_admin';
  }

  public canManageSubscriptions(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'super_admin';
  }

  public canManagePublicListings(user: User | null): boolean {
    if (!user) return false;
    return ['admin', 'super_admin'].includes(user.role);
  }
}

export const auth = new AuthService();

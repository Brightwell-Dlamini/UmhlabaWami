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

  private async restoreSession() {
    try {
      if (isSupabaseConfigured) {
        const user = await getSessionUser();
        if (user) {
          this.currentUser = user;
          this.currentOrg = null;
          this.notify();
          return;
        }
      }

      const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedId) {
        const found = db.users.find((u) => u.id === savedId);
        if (found) {
          this.currentUser = found;
          if (found.organization_id) {
            this.currentOrg =
              db.organizations.find((o) => o.id === found.organization_id) || null;
          }
          this.notify();
          return;
        }
      }
    } catch (e) {
      console.warn('Could not restore auth session', e);
    }
    this.currentUser = null;
    this.currentOrg = null;
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

  /**
   * Local/demo login against seeded db.users — always available for presentation
   * when Supabase has no matching rows yet.
   */
  private loginAgainstLocalSeed(
    organizationCode: string,
    username: string
  ): { success: boolean; error?: string; user?: User } {
    const trimmedOrgCode = organizationCode.trim().toUpperCase();
    const trimmedUser = username.trim().toLowerCase();

    if (trimmedUser === 'superadmin' || trimmedOrgCode === 'SUPER' || trimmedOrgCode === 'ADMIN') {
      const superAdmin = db.users.find((u) => u.role === 'super_admin');
      if (superAdmin) {
        this.setUser(superAdmin);
        try {
          db.logAudit(
            superAdmin.id,
            superAdmin.name,
            'LOGIN',
            'User',
            superAdmin.id,
            undefined,
            'Super Admin logged in (demo/local)'
          );
        } catch {
          /* ignore audit failures */
        }
        return { success: true, user: superAdmin };
      }
    }

    const org = db.organizations.find(
      (o) => o.organization_code.toUpperCase() === trimmedOrgCode
    );
    if (!org) {
      return {
        success: false,
        error: `Invalid Organisation Code "${trimmedOrgCode}". Please verify with your property administration.`,
      };
    }

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

    const user = db.users.find(
      (u) =>
        u.organization_id === org.id &&
        (u.username.toLowerCase() === trimmedUser || u.email.toLowerCase() === trimmedUser)
    );

    if (!user) {
      return {
        success: false,
        error: `User "${username}" not found in organisation ${org.company_name}.`,
      };
    }

    if (user.status !== 'Active') {
      return { success: false, error: `User account is currently ${user.status}.` };
    }

    this.setUser(user);
    try {
      db.logAudit(
        user.id,
        user.name,
        'LOGIN',
        'User',
        user.id,
        org.id,
        `User logged into ${org.company_name}`
      );
    } catch {
      /* ignore */
    }
    return { success: true, user };
  }

  /**
   * Synchronous login — uses local seed. Prefer loginAsync in UI.
   */
  public login(
    organizationCode: string,
    username: string,
    _password?: string
  ): { success: boolean; error?: string; user?: User } {
    return this.loginAgainstLocalSeed(organizationCode, username);
  }

  /**
   * Dual-mode login:
   * 1) Try Supabase when configured
   * 2) If remote has no org/user (empty project) or auth fails with "not found",
   *    fall back to local seed so demos/presentations never brick.
   */
  public async loginAsync(
    organizationCode: string,
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    if (isSupabaseConfigured) {
      try {
        const result = await supabaseLogin(organizationCode, username, password || 'password');
        if (result.success && result.user) {
          this.currentUser = result.user;
          this.currentOrg = result.organization || null;
          localStorage.setItem(AUTH_STORAGE_KEY, result.user.id);
          this.notify();
          return { success: true, user: result.user };
        }

        const err = (result.error || '').toLowerCase();
        const shouldFallback =
          err.includes('not found') ||
          err.includes('invalid organisation') ||
          err.includes('invalid organization') ||
          err.includes('super admin account not found') ||
          err.includes('empty');

        if (shouldFallback) {
          console.warn('[auth] Supabase login missed seed — falling back to local demo users.', result.error);
          return this.loginAgainstLocalSeed(organizationCode, username);
        }

        // Wrong password on a real remote user — do not silently bypass
        return { success: false, error: result.error || 'Login failed' };
      } catch (e) {
        console.warn('[auth] Supabase login error — demo fallback.', e);
        return this.loginAgainstLocalSeed(organizationCode, username);
      }
    }

    return this.loginAgainstLocalSeed(organizationCode, username);
  }

  public async logout() {
    if (this.currentUser && !isSupabaseConfigured) {
      try {
        db.logAudit(
          this.currentUser.id,
          this.currentUser.name,
          'LOGOUT',
          'User',
          this.currentUser.id,
          this.currentUser.organization_id
        );
      } catch {
        /* ignore */
      }
    }
    if (isSupabaseConfigured) {
      try {
        await supabaseLogout();
      } catch {
        /* ignore */
      }
    }
    this.currentUser = null;
    this.currentOrg = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.notify();
  }

  /** Instant role switch for demos — uses local seed users when present. */
  public switchDemoUser(role: UserRole) {
    let target = db.users.find((u) => u.role === role);
    if (!target) target = db.users[0];
    if (target) this.setUser(target);
  }

  public switchUserById(userId: string) {
    const user = db.users.find((u) => u.id === userId);
    if (user) this.setUser(user);
  }

  private setUser(user: User) {
    this.currentUser = user;
    this.currentOrg = user.organization_id
      ? db.organizations.find((o) => o.id === user.organization_id) || null
      : null;
    localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    this.notify();
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

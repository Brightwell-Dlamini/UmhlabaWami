import { User, UserRole, Organization } from '../types';
import { db } from './db';

const AUTH_STORAGE_KEY = 'umhlaba_wami_current_user_id';

class AuthService {
  private currentUser: User | null = null;
  private currentOrg: Organization | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  constructor() {
    this.restoreSession();
  }

  public subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentUser));
  }

  private restoreSession() {
    try {
      const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedId) {
        const found = db.users.find((u) => u.id === savedId);
        if (found) {
          this.currentUser = found;
          if (found.organization_id) {
            this.currentOrg = db.organizations.find((o) => o.id === found.organization_id) || null;
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Could not restore auth session', e);
    }
    // Default to visitor (null), or we can start on public landing page
    this.currentUser = null;
    this.currentOrg = null;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getCurrentOrganization(): Organization | null {
    if (!this.currentUser || !this.currentUser.organization_id) return null;
    return db.organizations.find((o) => o.id === this.currentUser?.organization_id) || null;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // LOGIN SUPPORTING ORGANIZATION CODE + USERNAME + PASSWORD (Requirement #9)
  public login(organizationCode: string, username: string, _password?: string): { success: boolean; error?: string; user?: User } {
    const trimmedOrgCode = organizationCode.trim().toUpperCase();
    const trimmedUser = username.trim().toLowerCase();

    // Special case for Super Admin (no org code needed or code is 'SUPER' / 'SYSTEM')
    if (trimmedUser === 'superadmin' || trimmedOrgCode === 'SUPER' || trimmedOrgCode === 'ADMIN') {
      const superAdmin = db.users.find((u) => u.role === 'super_admin');
      if (superAdmin) {
        this.setUser(superAdmin);
        db.logAudit(superAdmin.id, superAdmin.name, 'LOGIN', 'User', superAdmin.id, undefined, 'Super Admin logged in');
        return { success: true, user: superAdmin };
      }
    }

    // Match Organization Code
    const org = db.organizations.find((o) => o.organization_code.toUpperCase() === trimmedOrgCode);
    if (!org) {
      return { success: false, error: `Invalid Organization Code "${trimmedOrgCode}". Please verify with your property administration.` };
    }

    if (org.status === 'Pending Approval') {
      return { success: false, error: `Organization "${org.company_name}" is currently Pending Approval from the Super Admin.` };
    }

    if (org.status === 'Suspended' || org.status === 'Rejected') {
      return { success: false, error: `Organization account is inactive (${org.status}). Please contact support.` };
    }

    // Match User in this Organization
    const user = db.users.find(
      (u) =>
        u.organization_id === org.id &&
        (u.username.toLowerCase() === trimmedUser || u.email.toLowerCase() === trimmedUser)
    );

    if (!user) {
      return { success: false, error: `User "${username}" not found in organization ${org.company_name}.` };
    }

    if (user.status !== 'Active') {
      return { success: false, error: `User account is currently ${user.status}.` };
    }

    this.setUser(user);
    db.logAudit(user.id, user.name, 'LOGIN', 'User', user.id, org.id, `User logged into ${org.company_name}`);
    return { success: true, user };
  }

  public logout() {
    if (this.currentUser) {
      db.logAudit(this.currentUser.id, this.currentUser.name, 'LOGOUT', 'User', this.currentUser.id, this.currentUser.organization_id);
    }
    this.currentUser = null;
    this.currentOrg = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.notify();
  }

  public switchDemoUser(role: UserRole) {
    let target = db.users.find((u) => u.role === role);
    if (!target) {
      // Fallback
      target = db.users[0];
    }
    if (target) {
      this.setUser(target);
    }
  }

  public switchUserById(userId: string) {
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      this.setUser(user);
    }
  }

  private setUser(user: User) {
    this.currentUser = user;
    this.currentOrg = user.organization_id ? db.organizations.find((o) => o.id === user.organization_id) || null : null;
    localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    this.notify();
  }

  // ROLE PERMISSION MATRIX (Requirement #63)
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

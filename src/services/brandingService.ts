/**
 * Phase 6 — White-label branding.
 * Applies organisation primary colour, display name, and logo to CSS variables.
 */
import { db } from './db';

export interface BrandingConfig {
  organization_id: string;
  display_name: string;
  primary_color: string;
  accent_color: string;
  logo_url?: string;
  support_email?: string;
  custom_domain_hint?: string;
}

const KEY = 'umhlaba_wami_branding_v1';

function loadAll(): Record<string, BrandingConfig> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, BrandingConfig>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

class BrandingService {
  get(organizationId: string): BrandingConfig {
    const all = loadAll();
    if (all[organizationId]) return all[organizationId];
    const org = db.organizations.find((o) => o.id === organizationId);
    return {
      organization_id: organizationId,
      display_name: org?.company_name || 'Umhlaba Wami',
      primary_color: org?.custom_branding_color || '#2563eb',
      accent_color: '#0f172a',
      logo_url: org?.logo_url,
      support_email: org?.email,
      custom_domain_hint: undefined,
    };
  }

  save(config: BrandingConfig) {
    const all = loadAll();
    all[config.organization_id] = config;
    saveAll(all);
    const org = db.organizations.find((o) => o.id === config.organization_id);
    if (org) {
      org.custom_branding_color = config.primary_color;
      org.logo_url = config.logo_url;
      db.saveToStorage();
    }
    this.apply(config);
  }

  apply(config: BrandingConfig | null) {
    const root = document.documentElement;
    if (!config) {
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--brand-accent');
      return;
    }
    root.style.setProperty('--brand-primary', config.primary_color);
    root.style.setProperty('--brand-accent', config.accent_color);
  }

  applyForOrganization(organizationId?: string | null) {
    if (!organizationId) {
      this.apply(null);
      return;
    }
    this.apply(this.get(organizationId));
  }
}

export const branding = new BrandingService();

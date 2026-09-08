/**
 * Supabase client bootstrap (Phase 2).
 * When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set, the app runs in
 * backend mode. Otherwise it falls back to the Phase 1 localStorage demo layer.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const forceDemo = import.meta.env.VITE_FORCE_DEMO_MODE === 'true';

export const isSupabaseConfigured =
  !forceDemo && Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 20);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type BackendMode = 'supabase' | 'demo';

export function getBackendMode(): BackendMode {
  return isSupabaseConfigured ? 'supabase' : 'demo';
}

/**
 * Supabase client — sole backend for Umhlaba Wami.
 * Dual-mode / localStorage demo path has been removed.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  url && anonKey && url.startsWith('http') && anonKey.length > 20
);

if (!isSupabaseConfigured) {
  console.error(
    '[Umhlaba Wami] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. Dual-mode demo has been removed.'
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type BackendMode = 'supabase';

export function getBackendMode(): BackendMode {
  return 'supabase';
}

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
  return supabase;
}

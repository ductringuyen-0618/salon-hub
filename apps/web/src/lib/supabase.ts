import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Single Supabase client used across the app.
 *
 * Env vars (see apps/web/.env.example):
 *   VITE_SUPABASE_URL          — e.g. https://xxxx.supabase.co
 *   VITE_SUPABASE_PUBLISHABLE_KEY — sb_publishable_... (safe in client bundle)
 *
 * If either is missing, the app falls back to a stub client that throws on
 * use; AuthContext detects this and won't try to call signInWithPassword etc.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabaseConfigured: boolean = !!url && !!key;

export const supabase: SupabaseClient = createClient(
  url || 'https://invalid.supabase.co',
  key || 'invalid',
  {
    auth: {
      // Refresh tokens automatically; persist across reloads via localStorage.
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // for OAuth redirects later
      flowType: 'pkce',
    },
  }
);

if (!supabaseConfigured) {
  // Surface the misconfig once so dev knows
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY not set. ' +
    'Auth flows will not work until these are configured.'
  );
}

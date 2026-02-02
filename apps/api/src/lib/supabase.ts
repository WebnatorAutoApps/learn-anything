import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client authenticated with a user's Bearer token.
 * This replaces the cookie-based SSR client used in Next.js.
 */
export function createClient(token: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variable");
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

/**
 * Create an admin Supabase client (without user token).
 * Used for operations that don't require user context (e.g., login, signup).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variable");
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

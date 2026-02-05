/**
 * Supabase client injection.
 *
 * Each app provides its own SupabaseClient at startup so that
 * hooks can execute queries directly against Supabase.
 *
 * - Expo app: creates client with `createClient()` and passes it here
 */

import type { SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function setSupabaseClient(client: SupabaseClient) {
  _supabase = client;
}

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    throw new Error(
      "SupabaseClient not initialized. Call setSupabaseClient() at app startup."
    );
  }
  return _supabase;
}

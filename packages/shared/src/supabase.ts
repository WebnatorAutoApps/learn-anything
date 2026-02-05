/**
 * Supabase client injection.
 *
 * Each app provides its own SupabaseClient at startup so that
 * hooks can execute queries directly against Supabase.
 *
 * - Expo app: creates client with `createClient()` and passes it here
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { ERROR_MESSAGES } from "./constants/errors";

let _supabase: SupabaseClient | null = null;

export function setSupabaseClient(client: SupabaseClient) {
  _supabase = client;
}

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    throw new Error(ERROR_MESSAGES.SUPABASE_NOT_INITIALIZED);
  }
  return _supabase;
}

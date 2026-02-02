/**
 * Auth token provider abstraction.
 *
 * Each app sets its own token getter at startup so that
 * fetch helpers can attach Bearer tokens to API requests.
 *
 * - Expo app: reads from Supabase session
 * - Web: reads from Supabase session (token-based)
 */

let _getToken: () => Promise<string | null> = async () => null;

export function setAuthTokenProvider(fn: () => Promise<string | null>) {
  _getToken = fn;
}

export function getAuthToken(): Promise<string | null> {
  return _getToken();
}

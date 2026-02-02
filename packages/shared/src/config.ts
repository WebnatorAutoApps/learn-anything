/**
 * Runtime API base URL configuration.
 *
 * Each app must call `setApiBaseUrl()` at startup to configure
 * where API requests are sent.
 *
 * - Expo app: `setApiBaseUrl(process.env.EXPO_PUBLIC_API_URL)`
 * - Landing (no API calls): not needed
 */

let _apiBaseUrl = "";

export function setApiBaseUrl(url: string) {
  _apiBaseUrl = url.replace(/\/$/, "");
}

export function getApiBaseUrl(): string {
  return _apiBaseUrl;
}

/**
 * Resolve a relative API path to a full URL.
 * Absolute URLs (http/https) are returned as-is.
 */
export function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${_apiBaseUrl}${path}`;
}

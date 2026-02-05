import { type Locale, DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from "./types";

const SUPPORTED_CODES = new Set<string>(SUPPORTED_LOCALES.map((l) => l.code));

/**
 * Map a raw language tag (e.g. "zh-CN", "fr-FR", "pt") to a supported locale
 * or return null if no match.
 */
function mapToSupported(tag: string): Locale | null {
  const lower = tag.toLowerCase().trim();

  // Direct match ("en", "es", "fr", etc.)
  if (SUPPORTED_CODES.has(lower)) return lower as Locale;

  // Chinese variants → zh
  if (lower.startsWith("zh")) return "zh";

  // Language subtag match ("fr-FR" → "fr", "de-AT" → "de", etc.)
  const base = lower.split("-")[0];
  if (SUPPORTED_CODES.has(base)) return base as Locale;

  return null;
}

/**
 * Parse an Accept-Language style string and return the best matching locale.
 * E.g. "pt,es;q=0.8,en;q=0.5" → "es"
 */
export function parseAcceptLanguage(header: string): Locale | null {
  const entries = header
    .split(",")
    .map((part) => {
      const [lang, ...rest] = part.trim().split(";");
      const qMatch = rest.find((r) => r.trim().startsWith("q="));
      const q = qMatch ? parseFloat(qMatch.trim().slice(2)) : 1;
      return { lang: lang.trim(), q: isNaN(q) ? 0 : q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of entries) {
    const match = mapToSupported(lang);
    if (match) return match;
  }
  return null;
}

/**
 * Detect locale with priority: localStorage → navigator languages → default.
 * Call this only on the client.
 */
export function detectLocale(): Locale {
  // 1) Check localStorage for explicit user choice
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && SUPPORTED_CODES.has(stored)) return stored as Locale;
  } catch {
    // localStorage may be unavailable (private browsing, SSR, etc.)
  }

  // 2) Check browser languages (reflects Accept-Language)
  if (typeof navigator !== "undefined" && navigator.languages) {
    for (const lang of navigator.languages) {
      const match = mapToSupported(lang);
      if (match) return match;
    }
  }
  if (typeof navigator !== "undefined" && navigator.language) {
    const match = mapToSupported(navigator.language);
    if (match) return match;
  }

  // 3) Fallback
  return DEFAULT_LOCALE;
}

/**
 * Persist locale choice so it survives reloads.
 */
export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Silently ignore if storage is unavailable
  }
}

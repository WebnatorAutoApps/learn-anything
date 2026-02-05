/**
 * Username generation utilities.
 *
 * Ported from apps/api/src/lib/username.ts with crypto.getRandomValues
 * (works on web + React Native) instead of Node's crypto.randomBytes.
 */

/**
 * Normalize a name into a URL-safe slug suitable for use as a username prefix.
 * - Lowercased
 * - Spaces replaced with hyphens
 * - Special characters stripped (only a-z, 0-9, hyphens kept)
 * - Consecutive/leading/trailing hyphens collapsed/trimmed
 * - Falls back to "user" if the result is empty
 */
export function normalizeName(name: string | null | undefined): string {
  if (!name || !name.trim()) return "user";

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "user";
}

/**
 * Generate 5 random hexadecimal characters using crypto.getRandomValues.
 */
export function generateHexSuffix(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 5);
}

/**
 * Generate a username in the format `{normalized-name}-{5-hex-chars}`.
 */
export function generateUsername(name: string | null | undefined): string {
  const prefix = normalizeName(name);
  const suffix = generateHexSuffix();
  return `${prefix}-${suffix}`;
}

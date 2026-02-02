export interface Tip {
  id: string;
  messageKey: string;
  ctaLabelKey: string;
  /** Settings tab to open, or a route path to navigate to */
  ctaAction:
    | { type: "settings"; tab: "general" | "api-keys" | "customization" }
    | { type: "route"; path: string };
}

export const tips: Tip[] = [
  {
    id: "theme",
    messageKey: "themeMessage",
    ctaLabelKey: "themeCta",
    ctaAction: { type: "settings", tab: "customization" },
  },
  {
    id: "personality",
    messageKey: "personalityMessage",
    ctaLabelKey: "personalityCta",
    ctaAction: { type: "settings", tab: "customization" },
  },
  {
    id: "browse",
    messageKey: "browseMessage",
    ctaLabelKey: "browseCta",
    ctaAction: { type: "route", path: "/courses" },
  },
  {
    id: "profile",
    messageKey: "profileMessage",
    ctaLabelKey: "profileCta",
    ctaAction: { type: "settings", tab: "general" },
  },
  {
    id: "api-key",
    messageKey: "apiKeyMessage",
    ctaLabelKey: "apiKeyCta",
    ctaAction: { type: "settings", tab: "api-keys" },
  },
];

const LAST_TIP_KEY = "learn-anything-last-tip-id";

/**
 * Picks a random tip from the pool, avoiding the last-shown tip when possible.
 * Returns null if the pool is empty.
 */
export function pickRandomTip(pool: Tip[]): Tip | null {
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  let lastTipId: string | null = null;
  try {
    lastTipId = sessionStorage.getItem(LAST_TIP_KEY);
  } catch {
    // sessionStorage unavailable (SSR, private browsing, etc.)
  }

  const candidates = pool.filter((t) => t.id !== lastTipId);
  const source = candidates.length > 0 ? candidates : pool;
  const selected = source[Math.floor(Math.random() * source.length)];

  try {
    sessionStorage.setItem(LAST_TIP_KEY, selected.id);
  } catch {
    // ignore
  }

  return selected;
}

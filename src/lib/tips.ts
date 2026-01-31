export interface Tip {
  id: string;
  message: string;
  ctaLabel: string;
  /** Settings tab to open, or a route path to navigate to */
  ctaAction:
    | { type: "settings"; tab: "general" | "api-keys" | "customization" }
    | { type: "route"; path: string };
}

export const tips: Tip[] = [
  {
    id: "theme",
    message: "Did you know you can customize your theme? Try Space, School, Gym, or 90s Internet.",
    ctaLabel: "Change Theme",
    ctaAction: { type: "settings", tab: "customization" },
  },
  {
    id: "personality",
    message: "Want to be taught by a pirate? Customize your AI tone for a unique learning experience.",
    ctaLabel: "Choose a Tone",
    ctaAction: { type: "settings", tab: "customization" },
  },
  {
    id: "browse",
    message: "Explore learning paths created by the community and start a new journey today.",
    ctaLabel: "Browse Paths",
    ctaAction: { type: "route", path: "/courses" },
  },
  {
    id: "profile",
    message: "Set up your profile with a display name, username, and avatar to personalize your experience.",
    ctaLabel: "Edit Profile",
    ctaAction: { type: "settings", tab: "general" },
  },
  {
    id: "api-key",
    message: "Add your own Gemini API key to unlock AI-powered course generation.",
    ctaLabel: "Add API Key",
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

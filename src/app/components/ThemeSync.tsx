"use client";

import { useEffect } from "react";
import { useProfile, VALID_THEMES, type ThemeKey } from "@/lib/hooks/queries";
import { useTheme } from "@/lib/theme/context";

const STORAGE_KEY = "learn-anything-theme";

/**
 * Syncs the user's persisted theme preference from their profile
 * to the ThemeProvider. Runs once when the profile loads.
 */
export function ThemeSync() {
  const { data: profile } = useProfile();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!profile?.theme) return;

    // Validate the theme value from the server
    if (!VALID_THEMES.includes(profile.theme)) return;

    // Only sync from server if user hasn't already set a local preference
    // (localStorage is the source of truth for immediate changes)
    const localTheme = localStorage.getItem(STORAGE_KEY) as ThemeKey | null;
    if (!localTheme) {
      setTheme(profile.theme);
    }
  }, [profile?.theme, setTheme]);

  return null;
}

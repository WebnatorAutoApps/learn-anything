import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { vars } from "nativewind";
import type { ThemeKey } from "@learn-anything/shared";
import { DEFAULT_THEME } from "@learn-anything/shared";
import { themes } from "./themes";

const STORAGE_KEY = "learn-anything-theme";

interface ThemeContextValue {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  themeVars: ReturnType<typeof vars>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyWebTheme(theme: ThemeKey) {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>(DEFAULT_THEME);

  // Load persisted theme
  useEffect(() => {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored in themes) {
        setThemeState(stored as ThemeKey);
        applyWebTheme(stored as ThemeKey);
      }
    }
  }, []);

  const setTheme = useCallback((newTheme: ThemeKey) => {
    setThemeState(newTheme);
    applyWebTheme(newTheme);
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newTheme);
    }
  }, []);

  const themeVars = vars(themes[theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeVars }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

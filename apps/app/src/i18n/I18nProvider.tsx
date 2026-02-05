import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Platform } from "react-native";
import type { Locale, Translations } from "@learn-anything/shared";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  translationMap,
} from "@learn-anything/shared";

const SUPPORTED_CODES = new Set<string>(SUPPORTED_LOCALES.map((l) => l.code));

function detectLocale(): Locale {
  // Check stored preference
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && SUPPORTED_CODES.has(stored)) return stored as Locale;
  }

  // Check device language
  if (Platform.OS !== "web") {
    // React Native doesn't have navigator.languages but we can try
    try {
      const { getLocales } = require("expo-localization");
      const locales = getLocales();
      if (locales?.[0]?.languageCode) {
        const code = locales[0].languageCode;
        if (SUPPORTED_CODES.has(code)) return code as Locale;
      }
    } catch {
      // expo-localization not available
    }
  } else if (typeof navigator !== "undefined" && navigator.languages) {
    for (const lang of navigator.languages) {
      const base = lang.toLowerCase().split("-")[0];
      if (SUPPORTED_CODES.has(base)) return base as Locale;
    }
  }

  return DEFAULT_LOCALE;
}

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  }, []);

  const t = translationMap[locale] ?? translationMap[DEFAULT_LOCALE];

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

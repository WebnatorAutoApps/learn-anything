"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type Locale, type Translations, DEFAULT_LOCALE } from "./types";
import { detectLocale, persistLocale } from "./detect";

/* ── Static imports for each locale ── */
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import zh from "./locales/zh.json";

const translationMap: Record<Locale, Translations> = { en, es, fr, de, it, zh };

/* ── Context shape ── */

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  t: en,
  setLocale: () => {},
});

/* ── Provider ── */

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Lazy initializer runs once — safe to call detectLocale here on the client
    if (typeof window !== "undefined") return detectLocale();
    return DEFAULT_LOCALE;
  });

  // Update <html lang> attribute when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const value: I18nContextValue = {
    locale,
    t: translationMap[locale],
    setLocale,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/* ── Hook ── */

export function useI18n() {
  return useContext(I18nContext);
}

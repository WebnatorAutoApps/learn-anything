"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type Locale,
  type Translations,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  detectLocale,
  persistLocale,
  translationMap,
} from "@learn-anything/shared";

/* ── Context shape ── */

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  t: translationMap[DEFAULT_LOCALE],
  setLocale: () => {},
});

/* ── Provider ── */

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") return detectLocale();
    return DEFAULT_LOCALE;
  });

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

export { SUPPORTED_LOCALES, type Locale };

export type Locale = "en" | "es" | "fr" | "de" | "it" | "zh";

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "preferred_lang";

/* Nested translation shape — matches our JSON files */
export type TranslationValue = string | Record<string, string | Record<string, string>>;
export type Translations = Record<string, TranslationValue>;

import type { Locale, Translations } from "./types";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import zh from "./locales/zh.json";

export const translationMap: Record<Locale, Translations> = { en, es, fr, de, it, zh };

import { describe, it, expect } from "vitest";
import { translationMap } from "./translations";
import type { Locale } from "./types";

const REFERENCE_LOCALE: Locale = "en";
const reference = translationMap[REFERENCE_LOCALE];

/** Recursively collect all dot-separated keys from a nested object. */
function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...collectKeys(value as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

const referenceKeys = collectKeys(reference as unknown as Record<string, unknown>);

describe("i18n translation consistency", () => {
  const locales = Object.keys(translationMap).filter(
    (l) => l !== REFERENCE_LOCALE,
  ) as Locale[];

  for (const locale of locales) {
    it(`${locale} has exactly the same keys as ${REFERENCE_LOCALE}`, () => {
      const localeKeys = collectKeys(
        translationMap[locale] as unknown as Record<string, unknown>,
      );

      const missingInLocale = referenceKeys.filter(
        (k) => !localeKeys.includes(k),
      );
      const extraInLocale = localeKeys.filter(
        (k) => !referenceKeys.includes(k),
      );

      expect(missingInLocale, `${locale} is missing keys`).toEqual([]);
      expect(extraInLocale, `${locale} has extra keys`).toEqual([]);
    });
  }

  it(`${REFERENCE_LOCALE} has no empty string values`, () => {
    const emptyKeys: string[] = [];

    function checkEmpty(obj: Record<string, unknown>, prefix = "") {
      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof value === "string" && value.trim() === "") {
          emptyKeys.push(path);
        } else if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          checkEmpty(value as Record<string, unknown>, path);
        }
      }
    }

    checkEmpty(reference as unknown as Record<string, unknown>);
    expect(emptyKeys, "Empty string values found in reference locale").toEqual(
      [],
    );
  });
});

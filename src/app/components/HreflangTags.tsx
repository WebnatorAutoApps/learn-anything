"use client";

import { SUPPORTED_LOCALES } from "@/lib/i18n";

/**
 * Renders <link rel="alternate" hreflang="xx" /> tags for multi-language support.
 * Injected into <head> via React portal / Next.js <head> support.
 */
export default function HreflangTags() {
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";

  if (!baseUrl) return null;

  const path = "/";

  return (
    <>
      {SUPPORTED_LOCALES.map((loc) => (
        <link
          key={loc.code}
          rel="alternate"
          hrefLang={loc.code === "zh" ? "zh-CN" : loc.code}
          href={`${baseUrl}${path}?lang=${loc.code}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${path}`} />
    </>
  );
}

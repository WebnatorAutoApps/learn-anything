"use client";

import { useState } from "react";
import { useI18n, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import type { FeedbackMessage } from "@/lib/types";

export default function LanguageSettings() {
  const { locale, t, setLocale } = useI18n();
  const s = t.settings as Record<string, string>;
  const [message, setMessage] = useState<FeedbackMessage>(null);

  function handleSelectLanguage(code: Locale) {
    if (code === locale) return;
    setLocale(code);
    // Re-read the translated success message from the new locale (setLocale is sync)
    setMessage({ type: "success", text: s.languageSaved || "Language updated." });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-theme-primary">
          {s.language || "Language"}
        </h4>
        <p className="text-xs text-theme-muted">
          {s.languageHelp || "Choose the display language for the app. Learning path content stays in its original language."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUPPORTED_LOCALES.map((loc) => {
          const isActive = loc.code === locale;
          return (
            <button
              key={loc.code}
              type="button"
              onClick={() => handleSelectLanguage(loc.code)}
              className={`relative text-left rounded-lg border-2 p-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isActive
                  ? "border-theme-primary shadow-[0_0_12px_var(--t-glow)]"
                  : "border-theme-border hover:border-theme-primary-dim"
              }`}
              aria-pressed={isActive}
              aria-label={`${loc.nativeName}${isActive ? ` (${s.selected || "selected"})` : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">
                  {loc.flag}
                </span>
                <div>
                  <span className="text-sm font-semibold text-theme-primary block">
                    {loc.nativeName}
                  </span>
                  <span className="text-xs text-theme-muted block">
                    {loc.name}
                  </span>
                </div>
              </div>

              {isActive && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-theme-primary flex items-center justify-center">
                  <svg
                    className="h-3 w-3 text-theme-bg"
                    fill="none"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.type === "success"
              ? "text-theme-primary"
              : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

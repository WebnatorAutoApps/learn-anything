"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useProfile } from "@/lib/hooks";
import ApiKeySetupGuide from "./ApiKeySetupGuide";

interface ApiKeyBannerProps {
  onOpenSettings: (tab: "general" | "api-keys" | "customization") => void;
}

export default function ApiKeyBanner({ onOpenSettings }: ApiKeyBannerProps) {
  const { t } = useI18n();
  const g = t.apiKeyGuide as Record<string, string>;
  const { data: profile, isLoading } = useProfile();
  const [showGuide, setShowGuide] = useState(false);

  if (isLoading || !profile || profile.has_gemini_api_key) {
    return null;
  }

  function handleGoToSettings() {
    setShowGuide(false);
    onOpenSettings("api-keys");
  }

  return (
    <>
      <div
        role="status"
        className="relative z-20 border-b border-theme-secondary/30 bg-theme-secondary/5"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Key icon */}
              <svg
                className="h-4 w-4 flex-shrink-0 text-theme-secondary"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <p className="text-sm text-theme-primary truncate">
                {g.bannerText}
              </p>
            </div>
            <button
              onClick={() => setShowGuide(true)}
              className="rounded-md border border-theme-secondary/40 bg-theme-secondary/10 px-3 py-1 text-xs font-medium text-theme-secondary hover:bg-theme-secondary/20 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {g.bannerCta}
            </button>
          </div>
        </div>
      </div>

      {showGuide && (
        <ApiKeySetupGuide
          onClose={() => setShowGuide(false)}
          onGoToSettings={handleGoToSettings}
        />
      )}
    </>
  );
}

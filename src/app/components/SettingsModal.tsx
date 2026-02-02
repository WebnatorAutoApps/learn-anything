"use client";

import { useState } from "react";
import { useProfile, type SettingsTab } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import ErrorBoundary from "./ErrorBoundary";
import GeneralSettings from "./settings/GeneralSettings";
import ApiKeysSettings from "./settings/ApiKeysSettings";
import ToneSettings from "./settings/ToneSettings";
import ThemeSettings from "./settings/ThemeSettings";

interface SettingsModalProps {
  onClose: () => void;
  initialTab?: SettingsTab;
}

const TAB_IDS: SettingsTab[] = ["general", "api-keys", "customization"];

export default function SettingsModal({ onClose, initialTab = "general" }: SettingsModalProps) {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const c = t.common as Record<string, string>;
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const { data: profile, isLoading, isError } = useProfile();

  const tabLabels: Record<SettingsTab, string> = {
    "general": s.tabGeneral || "General",
    "api-keys": s.tabApiKeys || "API Keys",
    "customization": s.tabCustomization || "Customization",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl mx-4 rounded-lg border border-theme-border-strong bg-theme-surface shadow-lg max-h-[85vh] flex flex-col" style={{ boxShadow: `0 10px 25px -5px var(--t-glow)` }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme-border px-6 py-4 shrink-0">
          <h3 className="text-lg font-semibold text-theme-primary tracking-wide">
            <span className="text-theme-secondary">{">"}</span> {s.title || "Settings"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
            aria-label={c.close || "Close"}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body: Sidebar + Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <nav className="w-44 shrink-0 border-r border-theme-border py-3">
            {TAB_IDS.map((tabId) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={`w-full px-5 py-2.5 text-left text-sm transition-colors ${
                  activeTab === tabId
                    ? "text-theme-primary bg-theme-surface-hover border-r-2 border-theme-primary"
                    : "text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover"
                }`}
              >
                {tabLabels[tabId]}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-theme-secondary">{s.loadingSettings || "Loading settings..."}</span>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-red-400">{s.loadError || "Failed to load settings. Please try again later."}</span>
              </div>
            ) : (
              <ErrorBoundary>
                {activeTab === "general" && <GeneralSettings profile={profile!} />}
                {activeTab === "api-keys" && <ApiKeysSettings profile={profile!} />}
                {activeTab === "customization" && (
                  <div className="space-y-10">
                    <ToneSettings profile={profile!} />
                    <div className="border-t border-theme-border" />
                    <ThemeSettings />
                  </div>
                )}
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

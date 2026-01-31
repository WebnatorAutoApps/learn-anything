"use client";

import { useState } from "react";
import { useProfile } from "@/lib/hooks/queries";
import GeneralSettings from "./settings/GeneralSettings";
import ApiKeysSettings from "./settings/ApiKeysSettings";

type SettingsTab = "general" | "api-keys";

interface SettingsModalProps {
  onClose: () => void;
  initialTab?: SettingsTab;
}

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "api-keys", label: "API Keys" },
];

export default function SettingsModal({ onClose, initialTab = "general" }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const { data: profile, isLoading, isError } = useProfile();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl mx-4 rounded-lg border border-green-900/60 bg-green-950/95 shadow-lg shadow-green-900/30 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-900/40 px-6 py-4 shrink-0">
          <h3 className="text-lg font-semibold text-green-400 tracking-wide">
            <span className="text-green-600">{">"}</span> Settings
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-green-600 hover:text-green-400 hover:bg-green-900/40 transition-colors"
            aria-label="Close"
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
          <nav className="w-44 shrink-0 border-r border-green-900/40 py-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-5 py-2.5 text-left text-sm transition-colors ${
                  activeTab === tab.id
                    ? "text-green-400 bg-green-900/30 border-r-2 border-green-400"
                    : "text-green-600 hover:text-green-400 hover:bg-green-900/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-green-600">Loading settings...</span>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-red-400">Failed to load settings. Please try again later.</span>
              </div>
            ) : (
              <>
                {activeTab === "general" && <GeneralSettings profile={profile!} />}
                {activeTab === "api-keys" && <ApiKeysSettings profile={profile!} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

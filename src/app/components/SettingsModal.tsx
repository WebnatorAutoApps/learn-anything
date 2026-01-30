"use client";

import { useState } from "react";
import { useProfile, useSaveSettings } from "@/lib/hooks/queries";
import ApiKeySecurityModal from "./ApiKeySecurityModal";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  // Use profile query for initial settings data (uses cached data)
  const { data: profile, isLoading, isError } = useProfile();
  const saveMutation = useSaveSettings();

  const hasExistingKey = profile?.has_gemini_api_key ?? false;
  const maskedKey = profile?.api_key_last4
    ? "••••••••" + profile.api_key_last4
    : null;

  async function handleSave() {
    if (!apiKey.trim()) return;

    setMessage(null);

    try {
      await saveMutation.mutateAsync({ gemini_api_key: apiKey.trim() });
      setApiKey("");
      setMessage({ type: "success", text: "API key saved successfully." });
    } catch (err) {
      const text =
        err instanceof Error && err.message
          ? err.message
          : "Failed to save API key.";
      setMessage({ type: "error", text });
    }
  }

  async function handleClear() {
    setMessage(null);

    try {
      await saveMutation.mutateAsync({ gemini_api_key: "" });
      setApiKey("");
      setMessage({ type: "success", text: "API key cleared." });
    } catch (err) {
      const text =
        err instanceof Error && err.message
          ? err.message
          : "Failed to clear API key.";
      setMessage({ type: "error", text });
    }
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop — not dismissable */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg border border-green-900/60 bg-green-950/95 shadow-lg shadow-green-900/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-900/40 px-6 py-4">
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

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
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
              {/* Gemini API Key Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-green-400">
                    Gemini API Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecurityInfo(true)}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-green-700 hover:text-green-400 hover:bg-green-900/40 transition-colors"
                    aria-label="API key security information"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>

                <p className="text-xs text-green-700">
                  This key is used to generate learning plans and communicate
                  with the Gemini API. You can get one from{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 underline hover:text-green-400"
                  >
                    Google AI Studio
                  </a>
                  .
                </p>

                {/* Show masked key if one exists */}
                {hasExistingKey && maskedKey && (
                  <div className="flex items-center gap-2 rounded-lg border border-green-900/40 bg-green-950/40 px-3 py-2">
                    <span className="text-green-600 text-sm font-mono flex-1">
                      {maskedKey}
                    </span>
                    <span className="text-xs text-green-800">
                      (currently set)
                    </span>
                  </div>
                )}

                {/* Input for new key */}
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    hasExistingKey
                      ? "Enter a new key to replace the current one"
                      : "Enter your Gemini API key"
                  }
                  className="w-full rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors font-mono text-sm"
                />
              </div>

              {/* Status message */}
              {message && (
                <p
                  className={`text-sm ${
                    message.type === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {message.text}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={handleClear}
                  disabled={!hasExistingKey || saveMutation.isPending}
                  className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {saveMutation.isPending ? "Clearing..." : "Clear Key"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!apiKey.trim() || saveMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {saveMutation.isPending ? "Saving..." : "Save Key"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    {showSecurityInfo && (
      <ApiKeySecurityModal onClose={() => setShowSecurityInfo(false)} />
    )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useSaveSettings, type Profile } from "@/lib/hooks";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import type { FeedbackMessage } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import ApiKeySecurityModal from "../ApiKeySecurityModal";

interface ApiKeysSettingsProps {
  profile: Profile;
}

export default function ApiKeysSettings({ profile }: ApiKeysSettingsProps) {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const c = t.common as Record<string, string>;
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState<FeedbackMessage>(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const saveMutation = useSaveSettings();

  const hasExistingKey = profile.has_gemini_api_key;
  const maskedKey = profile.api_key_last4
    ? "••••••••" + profile.api_key_last4
    : null;

  async function handleSave() {
    if (!apiKey.trim()) return;

    setMessage(null);

    try {
      await saveMutation.mutateAsync({ gemini_api_key: apiKey.trim() });
      setApiKey("");
      setMessage({ type: "success", text: s.apiKeySaved || "API key saved successfully." });
    } catch (err) {
      const text =
        err instanceof Error && err.message
          ? err.message
          : ERROR_MESSAGES.API_KEY_SAVE_FAILED;
      setMessage({ type: "error", text });
    }
  }

  async function handleClear() {
    setMessage(null);

    try {
      await saveMutation.mutateAsync({ gemini_api_key: "" });
      setApiKey("");
      setMessage({ type: "success", text: s.apiKeyCleared || "API key cleared." });
    } catch (err) {
      const text =
        err instanceof Error && err.message
          ? err.message
          : ERROR_MESSAGES.API_KEY_CLEAR_FAILED;
      setMessage({ type: "error", text });
    }
  }

  return (
    <>
      <div className="space-y-5">
        {/* Gemini API Key Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-theme-primary">
              {s.geminiApiKey || "Gemini API Key"}
            </label>
            <button
              type="button"
              onClick={() => setShowSecurityInfo(true)}
              className="flex h-5 w-5 items-center justify-center rounded-full text-theme-muted hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
              aria-label={s.apiKeySecurityInfo || "API key security information"}
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

          <p className="text-xs text-theme-muted">
            {s.apiKeyHelpText || "This key is used to generate learning plans and communicate with the Gemini API. You can get one from"}{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-secondary underline hover:text-theme-primary"
            >
              {s.googleAiStudio || "Google AI Studio"}
            </a>
            .
          </p>

          {/* Show masked key if one exists */}
          {hasExistingKey && maskedKey && (
            <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-theme-surface px-3 py-2">
              <span className="text-theme-muted text-sm font-mono flex-1">
                {maskedKey}
              </span>
              <span className="text-xs text-theme-primary-faint">
                {s.currentlySet || "(currently set)"}
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
                ? (s.replaceKeyPlaceholder || "Enter a new key to replace the current one")
                : (s.enterKeyPlaceholder || "Enter your Gemini API key")
            }
            className="w-full rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-primary placeholder-theme-primary-faint focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary transition-colors font-mono text-sm"
          />
        </div>

        {/* Status message */}
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

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={handleClear}
            disabled={!hasExistingKey || saveMutation.isPending}
            className="px-4 py-2 rounded-lg border border-theme-border text-theme-primary hover:bg-theme-surface-hover transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saveMutation.isPending ? (s.clearing || "Clearing...") : (s.clearKey || "Clear Key")}
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey.trim() || saveMutation.isPending}
            className="px-4 py-2 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold hover:bg-theme-primary-hover transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saveMutation.isPending ? (c.saving || "Saving...") : (s.saveKey || "Save Key")}
          </button>
        </div>
      </div>

      {showSecurityInfo && (
        <ApiKeySecurityModal onClose={() => setShowSecurityInfo(false)} />
      )}
    </>
  );
}

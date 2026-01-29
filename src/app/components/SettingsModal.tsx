"use client";

import { useState, useEffect } from "react";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch current settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          if (data.profile?.has_gemini_api_key) {
            setHasExistingKey(true);
            setMaskedKey(data.profile.gemini_api_key);
          }
        } else {
          setMessage({ type: "error", text: "Failed to load settings. Please try again later." });
        }
      } catch {
        setMessage({ type: "error", text: "Failed to load settings. Please try again later." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    if (!apiKey.trim()) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gemini_api_key: apiKey.trim() }),
      });

      if (res.ok) {
        setHasExistingKey(true);
        setMaskedKey("••••••••" + apiKey.trim().slice(-4));
        setApiKey("");
        setMessage({ type: "success", text: "API key saved successfully." });
      } else {
        setMessage({ type: "error", text: "Failed to save API key." });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClear() {
    setIsClearing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gemini_api_key: "" }),
      });

      if (res.ok) {
        setHasExistingKey(false);
        setMaskedKey(null);
        setApiKey("");
        setMessage({ type: "success", text: "API key cleared." });
      } else {
        setMessage({ type: "error", text: "Failed to clear API key." });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred while clearing." });
    } finally {
      setIsClearing(false);
    }
  }

  return (
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
          ) : (
            <>
              {/* Gemini API Key Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-green-400">
                  Gemini API Key
                </label>

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
                  disabled={!hasExistingKey || isClearing}
                  className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isClearing ? "Clearing..." : "Clear Key"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!apiKey.trim() || isSaving}
                  className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Key"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

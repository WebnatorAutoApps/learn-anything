/**
 * Context + hook for managing the Gemini API key stored locally on the device.
 *
 * On web: localStorage
 * On native: expo-secure-store (via StorageAdapter)
 *
 * All consumers share the same state through GeminiKeyProvider.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getStorage } from "../storage";

const STORAGE_KEY = "gemini-api-key";

interface GeminiKeyContextValue {
  apiKey: string | null;
  hasKey: boolean;
  last4: string | null;
  isLoading: boolean;
  saveKey: (key: string) => Promise<void>;
  clearKey: () => Promise<void>;
}

const GeminiKeyContext = createContext<GeminiKeyContextValue | null>(null);

export function GeminiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const storage = getStorage();
        const stored = await storage.getItem(STORAGE_KEY);
        if (!cancelled) {
          setApiKey(stored);
        }
      } catch {
        // Storage not available yet — will resolve once adapter is set
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasKey = !!apiKey;
  const last4 = apiKey ? apiKey.slice(-4) : null;

  const saveKey = useCallback(async (key: string) => {
    const storage = getStorage();
    await storage.setItem(STORAGE_KEY, key);
    setApiKey(key);
  }, []);

  const clearKey = useCallback(async () => {
    const storage = getStorage();
    await storage.removeItem(STORAGE_KEY);
    setApiKey(null);
  }, []);

  return React.createElement(
    GeminiKeyContext.Provider,
    { value: { apiKey, hasKey, last4, isLoading, saveKey, clearKey } },
    children
  );
}

export function useGeminiKey() {
  const context = useContext(GeminiKeyContext);
  if (!context) {
    throw new Error("useGeminiKey must be used within a GeminiKeyProvider");
  }
  return context;
}

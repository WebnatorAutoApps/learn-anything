/**
 * Hook for managing the Gemini API key stored locally on the device.
 *
 * On web: localStorage
 * On native: expo-secure-store (via StorageAdapter)
 */

import { useState, useEffect, useCallback } from "react";
import { getStorage } from "../storage";

const STORAGE_KEY = "gemini-api-key";

export function useGeminiKey() {
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

  return { apiKey, hasKey, last4, isLoading, saveKey, clearKey };
}

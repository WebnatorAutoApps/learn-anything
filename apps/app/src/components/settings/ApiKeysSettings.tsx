import React, { useState } from "react";
import { View, Text } from "react-native";
import { useProfile, useSaveSettings } from "@learn-anything/shared";
import type { FeedbackMessage } from "@learn-anything/shared";
import { useI18n } from "../../i18n/I18nProvider";
import { Button, Input } from "../ui";

export default function ApiKeysSettings() {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const { data: profile } = useProfile();
  const saveSettings = useSaveSettings();
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  const hasKey = profile?.has_gemini_api_key;
  const last4 = profile?.api_key_last4;

  async function handleSave() {
    if (!apiKey.trim()) return;
    setMessage(null);
    try {
      await saveSettings.mutateAsync({ gemini_api_key: apiKey.trim() });
      setMessage({ type: "success", text: s.apiKeySaved || "API key saved successfully." });
      setApiKey("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save." });
    }
  }

  async function handleClear() {
    setMessage(null);
    try {
      await saveSettings.mutateAsync({ gemini_api_key: "" });
      setMessage({ type: "success", text: s.apiKeyCleared || "API key cleared." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to clear." });
    }
  }

  return (
    <View>
      <Text className="text-sm font-medium text-theme-secondary mb-2">
        {s.geminiApiKey || "Gemini API Key"}
      </Text>

      <Text className="text-xs text-theme-muted mb-3">
        {s.apiKeyHelpText || "This key is used to generate learning plans and communicate with the Gemini API."}{" "}
        {s.googleAiStudio || "Google AI Studio"}
      </Text>

      {hasKey && (
        <View className="bg-theme-surface-hover rounded-lg px-3 py-2 mb-3">
          <Text className="text-theme-secondary text-sm">
            {"••••••••"}{last4 ? last4 : ""} {s.currentlySet || "(currently set)"}
          </Text>
        </View>
      )}

      <Input
        value={apiKey}
        onChangeText={setApiKey}
        placeholder={
          hasKey
            ? (s.replaceKeyPlaceholder || "Enter a new key to replace the current one")
            : (s.enterKeyPlaceholder || "Enter your Gemini API key")
        }
        secureTextEntry
        className="mb-3"
      />

      <View className="flex-row gap-2">
        <Button onPress={handleSave} loading={saveSettings.isPending} disabled={!apiKey.trim()}>
          {s.saveKey || "Save Key"}
        </Button>
        {hasKey && (
          <Button variant="danger" onPress={handleClear}>
            {s.clearKey || "Clear Key"}
          </Button>
        )}
      </View>

      {message && (
        <Text className={`text-xs mt-2 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </Text>
      )}
    </View>
  );
}

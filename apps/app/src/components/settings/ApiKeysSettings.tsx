import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import { useGeminiKey } from "@learn-anything/shared";
import type { FeedbackMessage } from "@learn-anything/shared";
import { useI18n } from "../../i18n/I18nProvider";
import { Button, Input, Modal } from "../ui";

const STEP_KEYS = [
  { titleKey: "step1Title", bodyKey: "step1Body" },
  { titleKey: "step2Title", bodyKey: "step2Body" },
  { titleKey: "step3Title", bodyKey: "step3Body" },
  { titleKey: "step4Title", bodyKey: "step4Body" },
] as const;

const SECTION_KEYS = [
  { titleKey: "howWeStoreTitle", bodyKey: "howWeStoreBody" },
  { titleKey: "noSystemTitle", bodyKey: "noSystemBody" },
  { titleKey: "dedicatedKeyTitle", bodyKey: "dedicatedKeyBody" },
  { titleKey: "freeTierTitle", bodyKey: "freeTierBody" },
  { titleKey: "revokeTitle", bodyKey: "revokeBody" },
] as const;

export default function ApiKeysSettings() {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const sec = t.apiKeySecurity as Record<string, string>;
  const g = t.apiKeyGuide as Record<string, string>;
  const { hasKey, last4, saveKey, clearKey } = useGeminiKey();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [message, setMessage] = useState<FeedbackMessage | null>(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!apiKeyInput.trim()) return;
    setMessage(null);
    setIsSaving(true);
    try {
      await saveKey(apiKeyInput.trim());
      setMessage({ type: "success", text: s.apiKeySaved || "API key saved successfully." });
      setApiKeyInput("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClear() {
    setMessage(null);
    try {
      await clearKey();
      setMessage({ type: "success", text: s.apiKeyCleared || "API key cleared." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to clear." });
    }
  }

  return (
    <View>
      <View className="flex-row items-center gap-2 mb-2">
        <Text className="font-mono text-sm text-theme-muted uppercase tracking-wider">
          {">"} {s.geminiApiKey || "GEMINI_API_KEY"}
        </Text>
        <Pressable onPress={() => setShowSecurityInfo(true)}>
          <Text className="font-mono text-sm text-theme-primary">[?]</Text>
        </Pressable>
      </View>

      <Text className="font-mono text-sm text-theme-muted mb-3">
        {"// "}{s.apiKeyHelpText || "Used to generate learning plans via Gemini API."}{" "}
        <Text
          className="text-theme-primary underline"
          onPress={() => Linking.openURL("https://aistudio.google.com/apikey")}
        >
          {s.googleAiStudio || "Google AI Studio"}
        </Text>
      </Text>

      {hasKey ? (
        <View className="border border-theme-primary/20 bg-theme-surface px-3 py-2 mb-3">
          <Text className="font-mono text-base text-theme-secondary">
            KEY: ••••••••{last4 ? last4 : ""} <Text className="text-theme-primary">[SET]</Text>
          </Text>
        </View>
      ) : (
        <View className="border border-theme-secondary/30 bg-theme-surface mb-4">
          <Pressable
            onPress={() => setGuideExpanded(!guideExpanded)}
            className="flex-row items-center justify-between p-3"
          >
            <Text className="font-mono text-sm text-theme-secondary font-bold">
              ! {g?.title || "API_KEY_SETUP_GUIDE"}
            </Text>
            <Text className="font-mono text-sm text-theme-primary">
              [{guideExpanded ? "-" : "+"}]
            </Text>
          </Pressable>

          {guideExpanded && (
            <View className="px-3 pb-3 gap-3 border-t border-theme-primary/20">
              <Text className="font-mono text-sm text-theme-muted leading-relaxed mt-3">
                {g?.intro || "To generate personalized learning paths, this app uses Google's Gemini AI."}
              </Text>

              <View>
                <Text className="font-mono text-sm text-theme-primary font-bold mb-1">
                  {">"} {g?.whatIsTitle || "What is a Gemini API key?"}
                </Text>
                <Text className="font-mono text-sm text-theme-muted leading-relaxed">
                  {g?.whatIsBody || "An API key is a unique code that lets this app communicate with Google's AI."}
                </Text>
              </View>

              <View>
                <Text className="font-mono text-sm text-theme-primary font-bold mb-2">
                  {">"} {g?.stepsTitle || "How to get your API key"}
                </Text>
                <View className="gap-2">
                  {STEP_KEYS.map((step, index) => (
                    <View key={step.titleKey} className="flex-row gap-2">
                      <Text className="font-mono text-sm text-theme-primary">
                        [{String(index + 1).padStart(2, "0")}]
                      </Text>
                      <View className="flex-1">
                        <Text className="font-mono text-sm text-theme-primary font-bold">
                          {g?.[step.titleKey] || step.titleKey}
                        </Text>
                        <Text className="font-mono text-sm text-theme-muted leading-relaxed">
                          {g?.[step.bodyKey] || ""}{" "}
                          {step.titleKey === "step2Title" && (
                            <Text
                              className="text-theme-primary underline"
                              onPress={() => Linking.openURL("https://aistudio.google.com")}
                            >
                              aistudio.google.com
                            </Text>
                          )}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View className="border border-theme-primary/20 px-3 py-2">
                <Text className="font-mono text-sm text-theme-muted leading-relaxed">
                  <Text className="text-theme-primary font-bold">{g?.tipLabel || "Tip:"}</Text>{" "}
                  {g?.tipBody || "Create a dedicated API key just for this app."}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      <Input
        value={apiKeyInput}
        onChangeText={setApiKeyInput}
        placeholder={
          hasKey
            ? (s.replaceKeyPlaceholder || "Enter new key to replace...")
            : (s.enterKeyPlaceholder || "Enter your Gemini API key")
        }
        secureTextEntry
        className="mb-3"
      />

      <View className="flex-row gap-2">
        <Button onPress={handleSave} loading={isSaving} disabled={!apiKeyInput.trim()}>
          {s.saveKey || "SAVE_KEY"}
        </Button>
        {hasKey && (
          <Button variant="danger" onPress={handleClear}>
            {s.clearKey || "CLEAR_KEY"}
          </Button>
        )}
      </View>

      {message && (
        <Text className={`font-mono text-sm mt-2 ${message.type === "success" ? "text-theme-success" : "text-theme-error"}`}>
          {message.text}
        </Text>
      )}

      <Modal
        visible={showSecurityInfo}
        onClose={() => setShowSecurityInfo(false)}
        title={sec?.title || "API_KEY_SECURITY"}
      >
        <View className="gap-4">
          {SECTION_KEYS.map((section, index) => (
            <View key={section.titleKey}>
              <Text className="font-mono text-sm text-theme-primary font-bold mb-1">
                [{String(index + 1).padStart(2, "0")}] {sec?.[section.titleKey] || section.titleKey}
              </Text>
              <Text className="font-mono text-sm text-theme-muted leading-relaxed">
                {sec?.[section.bodyKey] || ""}
              </Text>
            </View>
          ))}
        </View>
      </Modal>
    </View>
  );
}

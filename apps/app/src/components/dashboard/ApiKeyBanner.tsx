import React, { useState } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { useGeminiKey } from "@learn-anything/shared";
import { useI18n } from "../../i18n/I18nProvider";
import { Button, Modal } from "../ui";

const STEP_KEYS = [
  { titleKey: "step1Title", bodyKey: "step1Body" },
  { titleKey: "step2Title", bodyKey: "step2Body" },
  { titleKey: "step3Title", bodyKey: "step3Body" },
  { titleKey: "step4Title", bodyKey: "step4Body" },
] as const;

interface ApiKeyBannerProps {
  onOpenSettings: (tab: "general" | "api-keys" | "customization") => void;
}

export default function ApiKeyBanner({ onOpenSettings }: ApiKeyBannerProps) {
  const { t } = useI18n();
  const g = t.apiKeyGuide as Record<string, string>;
  const { hasKey, isLoading } = useGeminiKey();
  const [showGuide, setShowGuide] = useState(false);

  if (isLoading || hasKey) {
    return null;
  }

  function handleGoToSettings() {
    setShowGuide(false);
    onOpenSettings("api-keys");
  }

  return (
    <>
      <View className="border border-theme-secondary/30 bg-theme-surface px-3 py-2 mb-4">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2 flex-1 min-w-0">
            <Text className="font-mono text-sm text-theme-secondary">!</Text>
            <Text className="font-mono text-sm text-theme-primary flex-1" numberOfLines={2}>
              {g?.bannerText || "No API key configured — you need one to create learning paths."}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowGuide(true)}
            className="border border-theme-secondary/30 px-2 py-1"
          >
            <Text className="font-mono text-sm text-theme-secondary font-bold">
              [{g?.bannerCta || "SETUP"}]
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title={g?.title || "API_KEY_SETUP"}
      >
        <View className="gap-4">
          {/* Intro */}
          <Text className="font-mono text-sm text-theme-muted leading-relaxed">
            {g?.intro || "To generate personalized learning paths, this app uses Google's Gemini AI."}
          </Text>

          {/* What is a Gemini API key */}
          <View>
            <Text className="font-mono text-sm text-theme-primary font-bold mb-1">
              {">"} {g?.whatIsTitle || "What is a Gemini API key?"}
            </Text>
            <Text className="font-mono text-sm text-theme-muted leading-relaxed">
              {g?.whatIsBody || "An API key is a unique code that lets this app communicate with Google's AI."}
            </Text>
          </View>

          {/* Steps */}
          <View>
            <Text className="font-mono text-sm text-theme-primary font-bold mb-2">
              {">"} {g?.stepsTitle || "How to get your API key"}
            </Text>
            <View className="gap-3">
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

          {/* Tip */}
          <View className="border border-theme-primary/20 bg-theme-surface px-3 py-2">
            <Text className="font-mono text-sm text-theme-muted leading-relaxed">
              <Text className="text-theme-primary font-bold">{g?.tipLabel || "Tip:"}</Text>{" "}
              {g?.tipBody || "Create a dedicated API key just for this app."}
            </Text>
          </View>

          {/* Actions */}
          <View className="flex-row gap-2 pt-2">
            <Button variant="secondary" onPress={() => setShowGuide(false)}>
              CLOSE
            </Button>
            <Button onPress={handleGoToSettings}>
              {g?.goToSettings || "GO_TO_SETTINGS"}
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

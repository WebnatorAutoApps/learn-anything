import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Modal as RNModal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SettingsTab } from "@learn-anything/shared";
import { useProfile } from "@learn-anything/shared";
import { useI18n } from "../../i18n/I18nProvider";
import GeneralSettings from "./GeneralSettings";
import ApiKeysSettings from "./ApiKeysSettings";
import ThemeSettings from "./ThemeSettings";
import ToneSettings from "./ToneSettings";
import LanguageSettings from "./LanguageSettings";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

export default function SettingsModal({
  visible,
  onClose,
  initialTab = "general",
}: SettingsModalProps) {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const insets = useSafeAreaInsets();
  const { isLoading, isError } = useProfile();

  useEffect(() => {
    if (visible) setActiveTab(initialTab);
  }, [visible, initialTab]);

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "general", label: "GENERAL" },
    { key: "api-keys", label: "API_KEYS" },
    { key: "customization", label: "CUSTOM" },
  ];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-theme-bg" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-2 border-b border-theme-primary/30 bg-theme-surface">
          <Text className="font-mono text-base font-bold text-theme-primary tracking-wider">
            {">"} {s.title || "SETTINGS"}
          </Text>
          <Pressable onPress={onClose} className="py-1">
            <Text className="font-mono text-base text-theme-muted">[ESC]</Text>
          </Pressable>
        </View>

        {/* Tab Bar */}
        <View className="flex-row border-b border-theme-primary/20 bg-theme-surface">
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 items-center border-b-2 ${
                activeTab === tab.key ? "border-theme-primary" : "border-transparent"
              }`}
            >
              <Text
                className={`font-mono text-sm ${
                  activeTab === tab.key ? "text-theme-primary font-bold" : "text-theme-muted"
                }`}
              >
                [{tab.label}]
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-4">
          {isLoading ? (
            <View className="py-12 items-center">
              <Text className="font-mono text-base text-theme-muted animate-blink">
                Loading configuration...
              </Text>
            </View>
          ) : isError ? (
            <View className="py-12 items-center">
              <Text className="font-mono text-base text-theme-error">
                ERROR: {s.loadError || "Failed to load settings."}
              </Text>
            </View>
          ) : (
            <>
              {activeTab === "general" && <GeneralSettings />}
              {activeTab === "api-keys" && <ApiKeysSettings />}
              {activeTab === "customization" && (
                <View className="gap-8">
                  <ThemeSettings />
                  <ToneSettings />
                  <LanguageSettings />
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </RNModal>
  );
}

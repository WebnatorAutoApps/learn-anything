import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal as RNModal } from "react-native";
import type { SettingsTab } from "@learn-anything/shared";
import { useProfile } from "@learn-anything/shared";
import { useI18n } from "../../i18n/I18nProvider";
import { Spinner } from "../ui";
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
  const { isLoading, isError } = useProfile();

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "general", label: s.tabGeneral || "General" },
    { key: "api-keys", label: s.tabApiKeys || "API Keys" },
    { key: "customization", label: s.tabCustomization || "Customization" },
  ];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-theme-bg">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-theme-border bg-theme-surface">
          <Text className="text-lg font-semibold text-theme-secondary">
            {s.title || "Settings"}
          </Text>
          <Pressable onPress={onClose} className="p-2">
            <Text className="text-theme-muted text-xl">✕</Text>
          </Pressable>
        </View>

        {/* Tab Bar */}
        <View className="flex-row border-b border-theme-border bg-theme-surface">
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === tab.key ? "border-theme-primary" : "border-transparent"
              }`}
            >
              <Text
                className={`text-sm ${
                  activeTab === tab.key ? "text-theme-primary font-medium" : "text-theme-muted"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-4">
          {isLoading ? (
            <View className="py-12 items-center">
              <Spinner size="large" />
              <Text className="text-theme-muted text-sm mt-2">
                {s.loadingSettings || "Loading settings..."}
              </Text>
            </View>
          ) : isError ? (
            <View className="py-12 items-center">
              <Text className="text-red-400 text-sm">
                {s.loadError || "Failed to load settings."}
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

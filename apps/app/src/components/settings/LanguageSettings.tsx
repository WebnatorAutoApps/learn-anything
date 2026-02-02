import React from "react";
import { View, Text, Pressable } from "react-native";
import { SUPPORTED_LOCALES } from "@learn-anything/shared";
import type { Locale } from "@learn-anything/shared";
import { useI18n } from "../../i18n/I18nProvider";

export default function LanguageSettings() {
  const { t, locale, setLocale } = useI18n();
  const s = t.settings as Record<string, string>;

  return (
    <View>
      <Text className="text-sm font-medium text-theme-secondary mb-1">
        {s.language || "Language"}
      </Text>
      <Text className="text-xs text-theme-muted mb-4">
        {s.languageHelp || "Choose the display language for the app."}
      </Text>

      <View className="gap-2">
        {SUPPORTED_LOCALES.map((loc) => (
          <Pressable
            key={loc.code}
            onPress={() => setLocale(loc.code as Locale)}
            className={`rounded-lg border p-3 flex-row items-center gap-3 ${
              locale === loc.code ? "border-theme-primary" : "border-theme-border"
            }`}
          >
            <Text className="text-xl">{loc.flag}</Text>
            <View>
              <Text className="text-theme-secondary text-sm font-medium">
                {loc.nativeName}
              </Text>
              <Text className="text-theme-muted text-xs">{loc.name}</Text>
            </View>
            {locale === loc.code && (
              <Text className="text-theme-primary text-xs ml-auto">✓</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

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
      <Text className="font-mono text-sm text-theme-muted uppercase tracking-wider mb-1">
        {">"} {s.language || "LOCALE"}
      </Text>
      <Text className="font-mono text-sm text-theme-muted mb-4">
        {"// "}{s.languageHelp || "Select display language."}
      </Text>

      <View className="gap-2">
        {SUPPORTED_LOCALES.map((loc, index) => (
          <Pressable
            key={loc.code}
            onPress={() => setLocale(loc.code as Locale)}
            className={`border p-3 flex-row items-center gap-3 ${
              locale === loc.code ? "border-theme-primary" : "border-theme-primary/15"
            }`}
          >
            <Text className="font-mono text-sm text-theme-primary">
              [{String(index + 1).padStart(2, "0")}]
            </Text>
            <Text className="text-xl">{loc.flag}</Text>
            <View className="flex-1">
              <Text className="font-mono text-base text-theme-secondary">
                {loc.nativeName}
              </Text>
              <Text className="font-mono text-sm text-theme-muted">{loc.name}</Text>
            </View>
            {locale === loc.code && (
              <Text className="font-mono text-sm text-theme-primary font-bold">* {s.selected || "ACTIVE"}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

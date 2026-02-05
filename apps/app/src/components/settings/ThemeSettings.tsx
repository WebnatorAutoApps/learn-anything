import React from "react";
import { View, Text, Pressable } from "react-native";
import { useSaveTheme, VALID_THEMES } from "@learn-anything/shared";
import type { ThemeKey } from "@learn-anything/shared";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n/I18nProvider";
import { themes } from "../../theme/themes";

export default function ThemeSettings() {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const { theme: currentTheme, setTheme } = useTheme();
  const saveThemeMutation = useSaveTheme();

  const themeLabels: Record<string, { name: string; desc: string }> = {
    terminal: { name: s.themeTerminal || "Terminal", desc: s.themeTerminalDesc || "Dark, monospace, hacker aesthetic" },
    space: { name: s.themeSpace || "Space", desc: s.themeSpaceDesc || "Deep-space palette, cosmic vibes" },
    school: { name: s.themeSchool || "School", desc: s.themeSchoolDesc || "Notebook textures, chalkboard colors" },
    gym: { name: s.themeGym || "Gym", desc: s.themeGymDesc || "Bold, energetic, sporty accents" },
    "90s-internet": { name: s.theme90s || "90s Internet", desc: s.theme90sDesc || "Retro web, bright colors, pixel vibes" },
  };

  async function handleThemeSelect(themeKey: ThemeKey) {
    const previousTheme = currentTheme;
    setTheme(themeKey);
    try {
      await saveThemeMutation.mutateAsync(themeKey);
    } catch {
      setTheme(previousTheme);
    }
  }

  const swatchKeys = ["--t-bg", "--t-surface", "--t-primary", "--t-secondary", "--t-accent"];

  return (
    <View>
      <Text className="font-mono text-sm text-theme-muted uppercase tracking-wider mb-1">
        {">"} {s.themes || "THEMES"}
      </Text>
      <Text className="font-mono text-sm text-theme-muted mb-4">
        {"// "}{s.themesHelp || "Select visual theme."}
      </Text>

      <View className="gap-2">
        {VALID_THEMES.map((key, index) => {
          const isSelected = key === currentTheme;
          const themeColors = themes[key];
          const label = themeLabels[key];

          return (
            <Pressable
              key={key}
              onPress={() => handleThemeSelect(key)}
              className={`border p-3 ${
                isSelected ? "border-theme-primary" : "border-theme-primary/15"
              }`}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="font-mono text-sm text-theme-primary">
                  [{String(index + 1).padStart(2, "0")}]
                </Text>
                {swatchKeys.map((swatchKey) => (
                  <View
                    key={swatchKey}
                    style={{ backgroundColor: themeColors[swatchKey] }}
                    className="h-4 w-4"
                  />
                ))}
              </View>
              <Text className="font-mono text-base text-theme-secondary">
                {label?.name || key}
              </Text>
              <Text className="font-mono text-sm text-theme-muted">
                {label?.desc || ""}
              </Text>
              {isSelected && (
                <Text className="font-mono text-sm text-theme-primary mt-1 font-bold">
                  * ACTIVE
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

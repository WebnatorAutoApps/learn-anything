import React, { useState } from "react";
import { View, Text, Pressable, Image, useWindowDimensions } from "react-native";
import { useI18n } from "../../i18n/I18nProvider";

interface DashboardHeaderProps {
  profileLoading: boolean;
  avatarUrl: string | null;
  userInitial: string;
  username?: string | null;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
  onBrowseClick: () => void;
}

export default function DashboardHeader({
  profileLoading,
  avatarUrl,
  userInitial,
  username,
  onSettingsClick,
  onLogoutClick,
  onBrowseClick,
}: DashboardHeaderProps) {
  const { t } = useI18n();
  const d = t.dashboard as Record<string, string>;
  const h = t.header as Record<string, string>;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 640;

  return (
    <View className="flex-row items-center justify-between px-4 py-2 border-b border-theme-primary/30 bg-theme-surface z-50 overflow-visible">
      <View className="flex-row items-center gap-1 flex-shrink min-w-0">
        <Text className="font-mono text-sm text-theme-muted">[</Text>
        <Text className="font-mono text-base font-bold text-theme-primary tracking-wider" numberOfLines={1}>
          LEARN-ANYTHING
        </Text>
        <Text className="font-mono text-sm text-theme-muted">]</Text>
        {isLargeScreen && (
          <Text className="font-mono text-xs text-theme-muted">v1.0</Text>
        )}
      </View>

      <View className="flex-row items-center gap-3 flex-shrink-0">
        {isLargeScreen && username && (
          <Text className="font-mono text-sm text-theme-muted" numberOfLines={1}>
            @{username}
          </Text>
        )}
        <View className="relative overflow-visible">
          <Pressable
            onPress={() => setIsMenuOpen(!isMenuOpen)}
            className="h-8 w-8 rounded border border-theme-primary/40 bg-theme-primary-dim items-center justify-center"
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="h-8 w-8 rounded"
              />
            ) : (
              <Text className="text-theme-primary font-mono font-bold text-xs">
                {profileLoading ? ".." : userInitial}
              </Text>
            )}
          </Pressable>

          {isMenuOpen && (
            <View className="absolute right-0 top-10 w-52 bg-theme-bg border border-theme-primary/30 z-50">
              <View className="px-3 py-1 border-b border-theme-primary/20 bg-theme-surface">
                <Text className="font-mono text-sm text-theme-muted">
                  -- {h.menuLabel || "MENU"} --
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setIsMenuOpen(false);
                  onBrowseClick();
                }}
                className="px-3 py-2 border-b border-theme-border"
              >
                <Text className="font-mono text-base text-theme-secondary">
                  {">"} {d.browsePaths || "Browse paths"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsMenuOpen(false);
                  onSettingsClick();
                }}
                className="px-3 py-2 border-b border-theme-border"
              >
                <Text className="font-mono text-base text-theme-secondary">
                  {">"} {h.settings || "Settings"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsMenuOpen(false);
                  onLogoutClick();
                }}
                className="px-3 py-2"
              >
                <Text className="font-mono text-base text-theme-error">
                  {">"} {h.logout || "Logout"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

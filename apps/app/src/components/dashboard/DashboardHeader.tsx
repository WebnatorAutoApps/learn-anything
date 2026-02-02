import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
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
  onSettingsClick,
  onLogoutClick,
  onBrowseClick,
}: DashboardHeaderProps) {
  const { t } = useI18n();
  const d = t.dashboard as Record<string, string>;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-theme-border bg-theme-surface">
      <Text className="text-lg font-semibold text-theme-primary">
        Learn Anything
      </Text>

      <View className="relative">
        <Pressable
          onPress={() => setIsMenuOpen(!isMenuOpen)}
          className="h-9 w-9 rounded-full bg-theme-primary-dim items-center justify-center overflow-hidden"
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-9 w-9 rounded-full"
            />
          ) : (
            <Text className="text-theme-primary font-semibold text-sm">
              {profileLoading ? "..." : userInitial}
            </Text>
          )}
        </Pressable>

        {isMenuOpen && (
          <View className="absolute right-0 top-11 w-48 bg-theme-surface border border-theme-border rounded-lg z-50 shadow-lg">
            <Pressable
              onPress={() => {
                setIsMenuOpen(false);
                onBrowseClick();
              }}
              className="px-4 py-3 border-b border-theme-border"
            >
              <Text className="text-sm text-theme-secondary">
                {d.browsePaths || "Browse Learning Paths"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setIsMenuOpen(false);
                onSettingsClick();
              }}
              className="px-4 py-3 border-b border-theme-border"
            >
              <Text className="text-sm text-theme-secondary">Settings</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setIsMenuOpen(false);
                onLogoutClick();
              }}
              className="px-4 py-3"
            >
              <Text className="text-sm text-red-400">Logout</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

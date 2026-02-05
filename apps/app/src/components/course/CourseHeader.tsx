import React from "react";
import { View, Text, Pressable } from "react-native";

interface CourseHeaderProps {
  title: string;
  isEnrolled: boolean;
  onBack: () => void;
  onInfo?: () => void;
  onQuit?: () => void;
  labels: {
    back: string;
    info: string;
    quit: string;
  };
}

export default function CourseHeader({
  title,
  isEnrolled,
  onBack,
  onInfo,
  onQuit,
  labels,
}: CourseHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-2 border-b border-theme-primary/30 bg-theme-surface">
      <Pressable onPress={onBack} className="py-1 shrink-0">
        <Text className="font-mono text-base text-theme-primary">
          {"< "}{labels.back}
        </Text>
      </Pressable>

      <Text
        className="font-mono text-sm text-theme-secondary mx-3 flex-1 text-center"
        numberOfLines={1}
      >
        $ {title}
      </Text>

      {isEnrolled && (
        <View className="flex-row items-center gap-2 shrink-0">
          {onInfo && (
            <Pressable onPress={onInfo} className="py-1">
              <Text className="font-mono text-base text-theme-primary">
                [{labels.info}]
              </Text>
            </Pressable>
          )}
          {onQuit && (
            <Pressable onPress={onQuit} className="py-1">
              <Text className="font-mono text-base text-theme-error">
                [{labels.quit}]
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

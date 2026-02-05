import React from "react";
import { View, Text } from "react-native";

interface CompletionCelebrationProps {
  labels: {
    pathComplete: string;
    completionMessage: string;
  };
}

export default function CompletionCelebration({
  labels,
}: CompletionCelebrationProps) {
  return (
    <View className="border border-theme-primary bg-theme-primary-faint p-6 mb-6 items-center">
      <Text className="font-mono text-theme-primary text-xl font-bold mb-2">
        === {labels.pathComplete} ===
      </Text>
      <Text className="font-mono text-theme-secondary text-sm text-center">
        {labels.completionMessage}
      </Text>
    </View>
  );
}

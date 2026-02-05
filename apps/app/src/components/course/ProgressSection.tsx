import React from "react";
import { View, Text } from "react-native";

interface ProgressSectionProps {
  completedCount: number;
  totalCount: number;
}

function getMotivationalMessage(pct: number, completedCount: number): string {
  if (pct === 0) return "Your journey begins now. Take the first step!";
  if (pct < 25) {
    return completedCount === 1
      ? "First step done! You're on your way."
      : "Keep going!";
  }
  if (pct < 50) return "Great progress! You're building real skills.";
  if (pct < 75) return "Halfway there! Keep the momentum going.";
  return "Almost there! The finish line is in sight.";
}

export default function ProgressSection({
  completedCount,
  totalCount,
}: ProgressSectionProps) {
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <View className="mb-6">
      <View className="flex-row items-baseline justify-between mb-2">
        <Text className="font-mono text-3xl font-bold text-theme-primary">
          {progressPct}%
        </Text>
        <Text className="font-mono text-sm text-theme-muted">
          [{completedCount}/{totalCount}]
        </Text>
      </View>

      <View className="h-3 bg-theme-surface overflow-hidden">
        <View
          className="h-full bg-theme-primary"
          style={{ width: `${progressPct}%` }}
        />
      </View>

      <Text className="font-mono text-sm text-theme-muted mt-2">
        {"// "}{getMotivationalMessage(progressPct, completedCount)}
      </Text>
    </View>
  );
}

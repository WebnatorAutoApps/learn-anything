import React from "react";
import { View, Text } from "react-native";
import { useI18n } from "../../i18n/I18nProvider";

interface ProgressSectionProps {
  completedCount: number;
  totalCount: number;
}

export default function ProgressSection({
  completedCount,
  totalCount,
}: ProgressSectionProps) {
  const { t } = useI18n();
  const p = t.progress as Record<string, string>;

  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  function getMotivationalMessage(pct: number, completed: number): string {
    if (pct === 0) return p.journeyBegins || "Your journey begins now. Take the first step!";
    if (pct < 25) {
      return completed === 1
        ? (p.firstStep || "First step done! You're on your way.")
        : (p.keepGoing || "Keep going!");
    }
    if (pct < 50) return p.greatProgress || "Great progress! You're building real skills.";
    if (pct < 75) return p.halfway || "Halfway there! Keep the momentum going.";
    return p.almostThere || "Almost there! The finish line is in sight.";
  }

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

import React from "react";
import { View, Text } from "react-native";
import type { Module } from "@learn-anything/shared";
import { formatDate } from "@learn-anything/shared";

interface TimelineItemProps {
  mod: Module;
  index: number;
}

export default function TimelineItem({ mod, index }: TimelineItemProps) {
  const isCurrent = mod.schedule?.status === "CURRENT";
  const isLocked = mod.schedule?.status === "LOCKED";

  const borderColor = isCurrent
    ? "border-theme-primary"
    : "border-theme-primary/10";

  const statusLabel = isCurrent
    ? "UP NEXT"
    : isLocked
    ? "LOCKED"
    : "";

  const statusColor = isCurrent
    ? "text-theme-primary"
    : "text-theme-muted";

  const opacity = isLocked ? "opacity-40" : "";

  const dateText = isCurrent && mod.schedule?.dueDate
    ? `due ${formatDate(mod.schedule.dueDate)}`
    : mod.schedule?.unlockDate
    ? `unlocks ${formatDate(mod.schedule.unlockDate)}`
    : "";

  return (
    <View className={`flex-row items-center p-2 border-l-2 ${borderColor} ${opacity}`}>
      <Text className="font-mono text-sm text-theme-primary w-10">
        [{String(index + 1).padStart(2, "0")}]
      </Text>
      <Text className="font-mono text-sm text-theme-secondary flex-1 mx-2" numberOfLines={1}>
        {mod.title}
      </Text>
      <View className="items-end shrink-0">
        {statusLabel !== "" && (
          <Text className={`font-mono text-xs font-bold ${statusColor}`}>
            {statusLabel}
          </Text>
        )}
        {dateText !== "" && (
          <Text className="font-mono text-xs text-theme-muted mt-0.5">
            {dateText}
          </Text>
        )}
      </View>
    </View>
  );
}

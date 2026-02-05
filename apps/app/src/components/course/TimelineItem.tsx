import React from "react";
import { View, Text } from "react-native";
import type { Module } from "@learn-anything/shared";
import { formatDate } from "@learn-anything/shared";
import { useI18n } from "../../i18n/I18nProvider";

interface TimelineItemProps {
  mod: Module;
  index: number;
}

export default function TimelineItem({ mod, index }: TimelineItemProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;
  const isCurrent = mod.schedule?.status === "CURRENT";
  const isLocked = mod.schedule?.status === "LOCKED";

  const borderColor = isCurrent
    ? "border-theme-primary"
    : "border-theme-primary/10";

  const statusLabel = isCurrent
    ? cr.upNext || "UP NEXT"
    : isLocked
    ? cr.locked || "LOCKED"
    : "";

  const statusColor = isCurrent
    ? "text-theme-primary"
    : "text-theme-muted";

  const opacity = isLocked ? "opacity-40" : "";

  const dateText = isCurrent && mod.schedule?.dueDate
    ? `${cr.duePrefix || "due"} ${formatDate(mod.schedule.dueDate)}`
    : mod.schedule?.unlockDate
    ? `${cr.unlocksPrefix || "unlocks"} ${formatDate(mod.schedule.unlockDate)}`
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

import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import type { Module } from "@learn-anything/shared";
import TimelineItem from "./TimelineItem";
import AchievementBadge from "./AchievementBadge";

interface ModuleTimelineProps {
  modules: Module[];
  heroIndex: number | null;
}

export default function ModuleTimeline({
  modules,
  heroIndex,
}: ModuleTimelineProps) {
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);

  const upcoming: { mod: Module; originalIndex: number }[] = [];
  const completed: { mod: Module; originalIndex: number }[] = [];

  modules.forEach((mod, i) => {
    if (i === heroIndex) return;
    if (mod.selectedProject?.completed) {
      completed.push({ mod, originalIndex: i });
    } else {
      upcoming.push({ mod, originalIndex: i });
    }
  });

  return (
    <View className="mb-8">
      {upcoming.length > 0 && (
        <View className="mb-4">
          <Pressable
            onPress={() => setUpcomingExpanded((prev) => !prev)}
            className="flex-row items-center justify-between mb-2"
          >
            <Text className="font-mono text-sm text-theme-muted uppercase tracking-wider">
              {upcomingExpanded ? "v" : ">"} UPCOMING STEPS ({upcoming.length})
            </Text>
            <Text className="font-mono text-xs text-theme-muted">
              [{upcomingExpanded ? "COLLAPSE" : "EXPAND"}]
            </Text>
          </Pressable>
          {upcomingExpanded && (
            <View className="gap-1">
              {upcoming.map(({ mod, originalIndex }) => (
                <TimelineItem key={mod.id} mod={mod} index={originalIndex} />
              ))}
            </View>
          )}
        </View>
      )}

      {completed.length > 0 && (
        <View>
          <Text className="font-mono text-sm text-theme-success uppercase tracking-wider mb-3">
            {">"} YOUR ACHIEVEMENTS ({completed.length})
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {completed.map(({ mod, originalIndex }) => (
              <AchievementBadge key={mod.id} mod={mod} index={originalIndex} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

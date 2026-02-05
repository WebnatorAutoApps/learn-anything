import React, { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import type { Module, Project } from "@learn-anything/shared";
import { formatDate } from "@learn-anything/shared";
import { Modal } from "../ui";

interface AchievementBadgeProps {
  mod: Module;
  index: number;
}

export default function AchievementBadge({ mod, index }: AchievementBadgeProps) {
  const [showDetail, setShowDetail] = useState(false);
  const project = mod.selectedProject
    ? mod.projects.find((p) => p.id === mod.selectedProject!.projectId)
    : null;

  return (
    <>
      <Pressable
        onPress={() => setShowDetail(true)}
        className="w-40 h-40 border border-theme-accent/40 bg-theme-accent/5 items-center justify-between pt-3 pb-3 px-2"
      >
        <Text className="text-5xl text-theme-accent leading-none">{"\u2605"}</Text>
        <Text className="font-mono text-xs text-theme-secondary text-center mt-2" numberOfLines={2}>
          {mod.title}
        </Text>
        <Text className="font-mono text-theme-accent/60 mt-2" style={{ fontSize: 9 }}>
          {mod.selectedProject?.completedAt
            ? formatDate(mod.selectedProject.completedAt.slice(0, 10))
            : ""}
        </Text>
      </Pressable>

      <Modal
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        title={`STEP ${String(index + 1).padStart(2, "0")}`}
      >
        <Text className="font-mono text-xs text-theme-accent font-bold tracking-widest mb-2">
          * ACHIEVEMENT UNLOCKED *
        </Text>
        <Text className="font-mono text-base text-theme-secondary font-bold mb-1">
          {">"} {mod.title}
        </Text>
        {mod.selectedProject?.completedAt && (
          <Text className="font-mono text-xs text-theme-accent/70 mb-3">
            {"// "}Cleared {formatDate(mod.selectedProject.completedAt.slice(0, 10))}
          </Text>
        )}

        {mod.description && (
          <Text className="font-mono text-sm text-theme-muted leading-relaxed mb-3">
            {mod.description}
          </Text>
        )}

        {project?.instructions && (
          <View className="border border-theme-primary/15 bg-theme-surface p-2 mb-3">
            <Text className="font-mono text-xs text-theme-muted uppercase tracking-wider mb-1">
              {">"} INSTRUCTIONS
            </Text>
            <Text className="font-mono text-sm text-theme-secondary leading-relaxed">
              {project.instructions}
            </Text>
          </View>
        )}

        {mod.selectedProject?.imageUrl && (
          <Image
            source={{ uri: mod.selectedProject.imageUrl }}
            className="w-full h-48 mb-3 border border-theme-accent/30"
            resizeMode="cover"
          />
        )}

        {mod.selectedProject?.comment && (
          <View className="border-l-2 border-theme-accent/40 pl-2">
            <Text className="font-mono text-sm text-theme-secondary leading-relaxed">
              {mod.selectedProject.comment}
            </Text>
          </View>
        )}
      </Modal>
    </>
  );
}

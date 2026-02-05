import React from "react";
import { View, Text } from "react-native";
import type { Module } from "@learn-anything/shared";
import { formatDate } from "@learn-anything/shared";
import ProjectSelectionArea from "./ProjectSelectionArea";

interface HeroProjectCardProps {
  mod: Module;
  index: number;
  courseId: string;
  heroIsLastCompleted: boolean;
  nextModuleTitle: string | null;
  onSelectProject: (params: {
    courseId: string;
    moduleId: string;
    projectId: string;
  }) => void;
  onCompleteProject: (params: {
    courseId: string;
    moduleId: string;
    comment?: string;
    imageUrl?: string;
  }) => void;
  isSelectLoading: boolean;
  isCompleteLoading: boolean;
}

function getStatusLabel(mod: Module): string {
  if (mod.selectedProject?.completed) return "COMPLETED";
  if (mod.selectedProject) return "IN PROGRESS";
  if (mod.schedule?.status === "CURRENT") return "ACTIVE";
  return "READY TO START";
}

function getStatusColor(mod: Module): string {
  if (mod.selectedProject?.completed) return "text-theme-success";
  if (mod.selectedProject) return "text-theme-warning";
  return "text-theme-primary";
}

export default function HeroProjectCard({
  mod,
  index,
  courseId,
  heroIsLastCompleted,
  nextModuleTitle,
  onSelectProject,
  onCompleteProject,
  isSelectLoading,
  isCompleteLoading,
}: HeroProjectCardProps) {
  const statusLabel = getStatusLabel(mod);
  const statusColor = getStatusColor(mod);

  return (
    <View className="border-2 border-theme-primary bg-theme-bg p-4 mb-6">
      <View className="flex-row items-center gap-2 mb-2">
        <Text className="font-mono text-sm text-theme-primary">
          [{String(index + 1).padStart(2, "0")}]
        </Text>
        <Text className="font-mono text-xs text-theme-primary font-bold">
          * CURRENT FOCUS
        </Text>
      </View>

      <Text className="font-mono text-lg font-bold text-theme-secondary mb-1">
        {">"} {mod.title}
      </Text>

      <View className="flex-row items-center gap-3 mb-2">
        <Text className={`font-mono text-xs font-bold ${statusColor}`}>
          {statusLabel}
        </Text>
        {mod.schedule?.dueDate && !mod.selectedProject?.completed && (
          <Text className="font-mono text-xs text-theme-muted">
            Due: {formatDate(mod.schedule.dueDate)}
          </Text>
        )}
      </View>

      {mod.description && (
        <Text className="font-mono text-sm text-theme-muted leading-relaxed">
          {"// "}{mod.description}
        </Text>
      )}

      <ProjectSelectionArea
        projects={mod.projects}
        selectedProject={mod.selectedProject}
        courseId={courseId}
        moduleId={mod.id}
        onSelectProject={onSelectProject}
        onCompleteProject={onCompleteProject}
        isSelectLoading={isSelectLoading}
        isCompleteLoading={isCompleteLoading}
      />

      {heroIsLastCompleted && nextModuleTitle && (
        <View className="mt-4 border-t border-theme-primary/20 pt-3">
          <Text className="font-mono text-sm text-theme-primary">
            {">"} Ready for the next step?
          </Text>
          <Text className="font-mono text-xs text-theme-muted mt-1">
            {"// "}Up next: {nextModuleTitle}
          </Text>
        </View>
      )}
    </View>
  );
}

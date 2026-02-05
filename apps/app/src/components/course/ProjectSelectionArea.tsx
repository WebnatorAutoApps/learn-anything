import React, { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import type { Project, SelectedProject } from "@learn-anything/shared";
import { formatDate } from "@learn-anything/shared";
import { Button } from "../ui";
import ProjectCompletionForm from "./ProjectCompletionForm";

interface ProjectSelectionAreaProps {
  projects: Project[];
  selectedProject: SelectedProject | null;
  courseId: string;
  moduleId: string;
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

export default function ProjectSelectionArea({
  projects,
  selectedProject,
  courseId,
  moduleId,
  onSelectProject,
  onCompleteProject,
  isSelectLoading,
  isCompleteLoading,
}: ProjectSelectionAreaProps) {
  if (projects.length === 0) {
    return (
      <View className="mt-3 p-2 border border-theme-primary/10">
        <Text className="font-mono text-sm text-theme-muted">
          {"// "}No projects available for this module.
        </Text>
      </View>
    );
  }

  // State: Completed
  if (selectedProject?.completed) {
    const selected = projects.find((p) => p.id === selectedProject.projectId);
    return (
      <View className="mt-3 border border-theme-success/40 bg-theme-success/5 p-3">
        <Text className="font-mono text-xs text-theme-success font-bold tracking-widest mb-2">
          * ACHIEVEMENT UNLOCKED *
        </Text>
        {selected && (
          <Text className="font-mono text-sm text-theme-secondary mb-1">
            {">"} {selected.title}
          </Text>
        )}
        {selectedProject.completedAt && (
          <Text className="font-mono text-xs text-theme-success/70 mb-2">
            {"// "}Cleared {formatDate(selectedProject.completedAt.slice(0, 10))}
          </Text>
        )}
        {selectedProject.imageUrl && (
          <Image
            source={{ uri: selectedProject.imageUrl }}
            className="w-full h-44 mb-2 border border-theme-success/30"
            resizeMode="cover"
          />
        )}
        {selectedProject.comment && (
          <View className="border-l-2 border-theme-success/40 pl-2">
            <Text className="font-mono text-sm text-theme-secondary leading-relaxed">
              {selectedProject.comment}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // State: Selected but not completed
  if (selectedProject) {
    return (
      <SelectedProjectView
        projects={projects}
        selectedProject={selectedProject}
        courseId={courseId}
        moduleId={moduleId}
        onCompleteProject={onCompleteProject}
        isCompleteLoading={isCompleteLoading}
      />
    );
  }

  // State: No selection — show project list
  return (
    <View className="mt-3 gap-1">
      <Text className="font-mono text-xs text-theme-muted uppercase tracking-wider mb-1">
        {"// "}Choose a project to work on:
      </Text>
      {projects.map((project, i) => (
        <View
          key={project.id}
          className="flex-row items-center justify-between border border-theme-primary/15 bg-theme-surface p-2"
        >
          <View className="flex-1 mr-2">
            <Text className="font-mono text-sm text-theme-secondary" numberOfLines={1}>
              [{String(i + 1).padStart(2, "0")}] {project.title}
            </Text>
          </View>
          <Pressable
            onPress={() =>
              onSelectProject({
                courseId,
                moduleId,
                projectId: project.id,
              })
            }
            disabled={isSelectLoading}
            className="border border-theme-primary/30 px-2 py-1"
          >
            <Text className="font-mono text-xs text-theme-primary font-bold">
              [SELECT]
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function SelectedProjectView({
  projects,
  selectedProject,
  courseId,
  moduleId,
  onCompleteProject,
  isCompleteLoading,
}: {
  projects: Project[];
  selectedProject: SelectedProject;
  courseId: string;
  moduleId: string;
  onCompleteProject: (params: {
    courseId: string;
    moduleId: string;
    comment?: string;
    imageUrl?: string;
  }) => void;
  isCompleteLoading: boolean;
}) {
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const selected = projects.find((p) => p.id === selectedProject.projectId);

  return (
    <View className="mt-3 border border-theme-primary/30 bg-theme-bg p-3">
      {selected && (
        <>
          <Text className="font-mono text-sm text-theme-primary font-bold mb-1">
            {">"} {selected.title}
          </Text>
          <Text className="font-mono text-xs text-theme-muted leading-relaxed mb-2">
            {selected.objective}
          </Text>
          {selected.instructions && (
            <View className="border border-theme-primary/15 bg-theme-surface p-2 mb-2">
              <Text className="font-mono text-xs text-theme-muted uppercase tracking-wider mb-1">
                {">"} INSTRUCTIONS
              </Text>
              <Text className="font-mono text-sm text-theme-secondary leading-relaxed">
                {selected.instructions}
              </Text>
            </View>
          )}
        </>
      )}

      {showCompletionForm ? (
        <ProjectCompletionForm
          onComplete={(comment, imageUrl) =>
            onCompleteProject({ courseId, moduleId, comment, imageUrl })
          }
          isLoading={isCompleteLoading}
        />
      ) : (
        <Button onPress={() => setShowCompletionForm(true)}>
          DID YOU FINISH?
        </Button>
      )}
    </View>
  );
}

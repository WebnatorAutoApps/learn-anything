import React from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useCourseDetail,
  useEnrollCourse,
  useUnenrollCourse,
  ERROR_MESSAGES,
} from "@learn-anything/shared";
import type { Module } from "@learn-anything/shared";
import { useI18n } from "../../../src/i18n/I18nProvider";
import { Button } from "../../../src/components/ui";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;
  const c = t.common as Record<string, string>;

  const {
    data,
    isLoading,
    isError,
    error: queryError,
  } = useCourseDetail(id || "");

  const enrollMutation = useEnrollCourse();
  const unenrollMutation = useUnenrollCourse();

  if (isLoading) {
    return (
      <View className="flex-1 bg-theme-bg items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !data) {
    const errorMessage =
      (queryError as Error & { status?: number })?.status === 404
        ? ERROR_MESSAGES.COURSE_NOT_FOUND
        : (queryError as Error)?.message || ERROR_MESSAGES.COURSE_LOAD_FAILED;

    return (
      <View className="flex-1 bg-theme-bg items-center justify-center px-6">
        <Text className="text-red-400 text-lg mb-4">{errorMessage}</Text>
        <Button onPress={() => router.back()}>
          {cr.backToDashboard || "Back to Dashboard"}
        </Button>
      </View>
    );
  }

  const { course, isEnrolled, isOwner } = data;

  async function handleEnroll() {
    try {
      await enrollMutation.mutateAsync({
        courseId: course.id,
        isOwner,
        commitmentIntervalDays: 3,
      });
    } catch {
      // error handled by mutation
    }
  }

  async function handleUnenroll() {
    try {
      await unenrollMutation.mutateAsync(course.id);
      router.back();
    } catch {
      // error handled by mutation
    }
  }

  // Compute progress
  const completedCount = course.modules.filter(
    (m) => m.selectedProject?.completed
  ).length;
  const totalCount = course.modules.length;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <View className="flex-1 bg-theme-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-theme-border bg-theme-surface">
        <Pressable onPress={() => router.back()} className="py-1">
          <Text className="text-theme-primary text-sm">
            {c.back || "Back"}
          </Text>
        </Pressable>
        {isEnrolled && (
          <Pressable onPress={handleUnenroll} className="py-1">
            <Text className="text-red-400 text-sm">
              {cr.unenroll || "Unenroll"}
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Title */}
        <Text className="text-2xl font-semibold text-theme-primary mb-2">
          <Text className="text-theme-secondary">{">"} </Text>
          {course.normalized_title}
        </Text>

        {/* Description */}
        <Text className="text-theme-secondary text-base mb-2">
          {course.learning_goal}
        </Text>
        <Text className="text-theme-muted text-sm mb-6 leading-relaxed">
          {course.learning_goal_details}
        </Text>

        {/* Info Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <InfoCard
            label={cr.stepsLabel || "Steps"}
            value={String(course.total_modules)}
          />
          <InfoCard
            label={cr.yourLevel || "Your Level"}
            value={course.expertise_level}
          />
          <InfoCard
            label={cr.targetLevel || "Target Level"}
            value={course.expected_skill_level}
          />
          <InfoCard
            label={cr.successRate || "Success Rate"}
            value={`${course.likelihood_of_learning}%`}
          />
        </View>

        {/* Expertise details */}
        {course.expertise_details && (
          <View className="rounded-lg border border-theme-border bg-theme-surface p-4 mb-6">
            <Text className="text-xs text-theme-muted uppercase tracking-wider mb-1">
              {cr.yourBackground || "Your Background"}
            </Text>
            <Text className="text-theme-secondary text-sm leading-relaxed">
              {course.expertise_details}
            </Text>
          </View>
        )}

        {/* Progress */}
        {isEnrolled && totalCount > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between mb-1">
              <Text className="text-theme-muted text-xs">Progress</Text>
              <Text className="text-theme-primary text-xs">
                {completedCount}/{totalCount}
              </Text>
            </View>
            <View className="h-2 bg-theme-surface rounded-full overflow-hidden">
              <View
                className="h-full bg-theme-primary rounded-full"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </View>
          </View>
        )}

        {/* Completion celebration */}
        {allCompleted && (
          <View className="rounded-lg border border-theme-primary bg-theme-primary-faint p-6 mb-6 items-center">
            <Text className="text-theme-primary text-xl font-bold mb-2">
              {cr.pathComplete || "Path Complete!"}
            </Text>
            <Text className="text-theme-secondary text-sm text-center">
              {cr.completionMessage || "Every step you took brought you closer to mastery."}
            </Text>
          </View>
        )}

        {/* Enroll CTA */}
        {!isEnrolled && (
          <View className="mb-6">
            <Button
              onPress={handleEnroll}
              loading={enrollMutation.isPending}
            >
              {cr.startNow || "Start Now"}
            </Button>
          </View>
        )}

        {/* Module List */}
        {course.modules.length > 0 && (
          <View className="gap-3 mb-8">
            <Text className="text-theme-secondary font-medium text-sm mb-2">
              {cr.learningPathSteps || "Learning Path Steps"}
            </Text>
            {course.modules.map((mod, i) => (
              <ModuleCard
                key={mod.id}
                mod={mod}
                index={i}
                isEnrolled={isEnrolled}
                courseId={course.id}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-lg border border-theme-border bg-theme-surface p-3 flex-1 min-w-[140px]">
      <Text className="text-xs text-theme-muted uppercase tracking-wider mb-1">
        {label}
      </Text>
      <Text className="text-sm font-semibold text-theme-primary">{value}</Text>
    </View>
  );
}

function ModuleCard({
  mod,
  index,
  isEnrolled,
  courseId,
}: {
  mod: Module;
  index: number;
  isEnrolled: boolean;
  courseId: string;
}) {
  const isCompleted = mod.selectedProject?.completed;
  const isCurrent = mod.schedule?.status === "CURRENT";
  const isLocked = mod.schedule?.status === "LOCKED";

  const statusColors = isCompleted
    ? "border-green-800 bg-green-950/20"
    : isCurrent
    ? "border-theme-primary"
    : isLocked
    ? "border-theme-border opacity-60"
    : "border-theme-border";

  return (
    <View className={`rounded-lg border p-4 ${statusColors}`}>
      <View className="flex-row items-center gap-3">
        <View
          className={`h-8 w-8 rounded-full items-center justify-center ${
            isCompleted
              ? "bg-green-800"
              : isCurrent
              ? "bg-theme-primary-dim"
              : "bg-theme-surface"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              isCompleted
                ? "text-green-400"
                : isCurrent
                ? "text-theme-primary"
                : "text-theme-muted"
            }`}
          >
            {isCompleted ? "✓" : index + 1}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-theme-secondary text-sm font-medium">
            {mod.title}
          </Text>
          {isEnrolled && mod.description && (
            <Text className="text-theme-muted text-xs mt-0.5" numberOfLines={2}>
              {mod.description}
            </Text>
          )}
        </View>
        {isCompleted && (
          <Text className="text-green-400 text-xs uppercase font-medium">Done</Text>
        )}
        {isCurrent && (
          <Text className="text-theme-primary text-xs uppercase font-medium">Active</Text>
        )}
        {isLocked && (
          <Text className="text-theme-muted text-xs uppercase">Locked</Text>
        )}
      </View>

      {/* Show projects for current module */}
      {isEnrolled && isCurrent && mod.projects.length > 0 && (
        <View className="mt-3 gap-2">
          {mod.projects.map((project, pi) => (
            <View
              key={project.id}
              className="rounded-md border border-theme-border bg-theme-surface-hover p-3"
            >
              <Text className="text-theme-secondary text-xs font-medium mb-1">
                {project.title}
              </Text>
              <Text className="text-theme-muted text-xs" numberOfLines={3}>
                {project.objective}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

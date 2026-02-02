import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useCourses } from "@learn-anything/shared";
import type { CourseListItem } from "@learn-anything/shared";
import { useI18n } from "../../src/i18n/I18nProvider";

type StatusFilter = "all" | "started" | "not_started";

export default function CoursesScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const c = t.common as Record<string, string>;
  const d = t.dashboard as Record<string, string>;

  const [filter, setFilter] = useState<StatusFilter>("all");

  const { data: allCourses = [], isLoading: loadingAll } = useCourses("all");
  const { data: startedCourses = [], isLoading: loadingStarted } = useCourses("started");
  const { data: notStartedCourses = [], isLoading: loadingNotStarted } = useCourses("not_started");

  const courses =
    filter === "started"
      ? startedCourses
      : filter === "not_started"
      ? notStartedCourses
      : allCourses;

  const isLoading =
    filter === "started"
      ? loadingStarted
      : filter === "not_started"
      ? loadingNotStarted
      : loadingAll;

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "started", label: "Enrolled" },
    { key: "not_started", label: "Browse" },
  ];

  return (
    <View className="flex-1 bg-theme-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-theme-border bg-theme-surface">
        <Pressable onPress={() => router.back()} className="py-1">
          <Text className="text-theme-primary text-sm">{c.back || "Back"}</Text>
        </Pressable>
        <Text className="text-theme-secondary text-base font-semibold">
          {d.browsePaths || "Browse Learning Paths"}
        </Text>
        <View className="w-10" />
      </View>

      {/* Filter Tabs */}
      <View className="flex-row border-b border-theme-border bg-theme-surface">
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={`flex-1 py-3 items-center border-b-2 ${
              filter === f.key ? "border-theme-primary" : "border-transparent"
            }`}
          >
            <Text
              className={`text-sm ${
                filter === f.key ? "text-theme-primary font-medium" : "text-theme-muted"
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Course List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : courses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-theme-muted text-sm text-center">
            No courses found.
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          <View className="gap-3">
            {courses.map((course) => (
              <CourseListCard
                key={course.id}
                course={course}
                onPress={() => router.push(`/(app)/course/${course.id}`)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function CourseListCard({
  course,
  onPress,
}: {
  course: CourseListItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-lg border border-theme-border bg-theme-surface p-4"
    >
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 rounded-lg bg-theme-primary-dim items-center justify-center">
          <Text className="text-theme-primary font-bold text-lg">
            {course.normalized_title.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-theme-secondary font-medium text-sm mb-1">
            {course.normalized_title}
          </Text>
          <View className="flex-row gap-3">
            <Text className="text-theme-muted text-xs">
              {course.total_modules} modules
            </Text>
            <Text className="text-theme-muted text-xs">
              {course.expected_skill_level}
            </Text>
            {course.isEnrolled && (
              <Text className="text-theme-primary text-xs font-medium">
                Enrolled
              </Text>
            )}
          </View>
        </View>
        <Text className="text-theme-primary text-xs">
          {course.likelihood_of_learning}%
        </Text>
      </View>
    </Pressable>
  );
}

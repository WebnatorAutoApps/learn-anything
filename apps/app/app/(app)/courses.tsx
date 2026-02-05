import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
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
  const cs = t.courses as Record<string, string>;

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
    { key: "all", label: cs.all || "ALL" },
    { key: "started", label: cs.enrolled || "ENROLLED" },
    { key: "not_started", label: cs.browse || "BROWSE" },
  ];

  return (
    <View className="flex-1 bg-theme-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-theme-primary/30 bg-theme-surface">
        <Pressable onPress={() => router.back()} className="py-1">
          <Text className="font-mono text-base text-theme-primary">{"< "}{c.back || "back"}</Text>
        </Pressable>
        <Text className="font-mono text-base font-bold text-theme-primary tracking-wider">
          {d.browsePaths || "LEARNING PATHS"}
        </Text>
        <View className="w-10" />
      </View>

      {/* Filter Tabs */}
      <View className="flex-row border-b border-theme-primary/20 bg-theme-surface">
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={`flex-1 py-2 items-center border-b-2 ${
              filter === f.key ? "border-theme-primary" : "border-transparent"
            }`}
          >
            <Text
              className={`font-mono text-sm ${
                filter === f.key ? "text-theme-primary font-bold" : "text-theme-muted"
              }`}
            >
              [{f.label}]
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Course List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="font-mono text-base text-theme-muted animate-blink">
            {cs.querying || "Querying database..."}
          </Text>
        </View>
      ) : courses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-mono text-base text-theme-muted text-center">
            {">"} {cs.noRecords || "No records found."}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          <Text className="font-mono text-sm text-theme-muted mb-3">
            {">"} {courses.length} {cs.recordsReturned || "record(s) returned"}
          </Text>
          <View className="gap-2">
            {courses.map((course, index) => (
              <CourseListCard
                key={course.id}
                course={course}
                index={index}
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
  index,
  onPress,
}: {
  course: CourseListItem;
  index: number;
  onPress: () => void;
}) {
  const { t } = useI18n();
  const c = t.common as Record<string, string>;
  const cs = t.courses as Record<string, string>;

  return (
    <Pressable
      onPress={onPress}
      className="border border-theme-primary/20 bg-theme-bg p-3"
    >
      <View className="flex-row items-center gap-3">
        <Text className="font-mono text-sm text-theme-primary">
          [{String(index + 1).padStart(2, "0")}]
        </Text>
        <View className="flex-1">
          <Text className="font-mono text-theme-secondary text-base mb-0.5">
            {course.normalized_title}
          </Text>
          <View className="flex-row gap-3">
            <Text className="font-mono text-theme-muted text-sm">
              {course.total_modules} {cs.modules || "modules"}
            </Text>
            <Text className="font-mono text-theme-muted text-sm">
              {cs.levelPrefix || "lvl:"}{course.expected_skill_level}
            </Text>
            {course.isEnrolled && (
              <Text className="font-mono text-theme-primary text-sm font-bold">
                {c.active || "ACTIVE"}
              </Text>
            )}
          </View>
        </View>
        <Text className="font-mono text-theme-primary text-sm">
          {course.likelihood_of_learning}%
        </Text>
      </View>
    </Pressable>
  );
}

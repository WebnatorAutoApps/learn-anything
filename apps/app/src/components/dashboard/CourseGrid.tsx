import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import type { CourseListItem } from "@learn-anything/shared";
import { useI18n } from "../../i18n/I18nProvider";

interface CourseGridProps {
  courses: CourseListItem[];
  isLoading: boolean;
  onLearnClick: () => void;
}

export default function CourseGrid({ courses, isLoading, onLearnClick }: CourseGridProps) {
  const router = useRouter();
  const { t } = useI18n();
  const d = t.dashboard as Record<string, string>;

  if (isLoading) {
    return (
      <View className="py-12 items-center">
        <Text className="font-mono text-base text-theme-muted animate-blink">
          Loading processes...
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text className="font-mono text-sm text-theme-muted mb-3">
        {">"} {courses.length} active process{courses.length !== 1 ? "es" : ""} found
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {courses.map((course, index) => (
          <Pressable
            key={course.id}
            onPress={() => router.push(`/(app)/course/${course.id}`)}
            className="bg-theme-bg border border-theme-primary/20 p-3 flex-1 min-w-[180px] max-w-[300px]"
          >
            <View className="flex-row items-center mb-2">
              <Text className="font-mono text-sm text-theme-primary">
                PID:{String(index + 1).padStart(3, "0")}
              </Text>
              <View className="ml-2 h-2 w-2 rounded-full bg-theme-primary" />
              <Text className="font-mono text-sm text-theme-muted ml-1">
                RUNNING
              </Text>
            </View>
            <Text
              className="font-mono text-theme-secondary text-base mb-1"
              numberOfLines={2}
            >
              {course.normalized_title}
            </Text>
            <Text className="font-mono text-theme-muted text-sm">
              {course.total_modules} modules loaded
            </Text>
          </Pressable>
        ))}

        <Pressable
          onPress={onLearnClick}
          className="bg-theme-bg border border-dashed border-theme-primary/30 p-3 flex-1 min-w-[180px] max-w-[300px] items-center justify-center"
        >
          <Text className="font-mono text-theme-primary text-lg mb-1">
            +
          </Text>
          <Text className="font-mono text-theme-muted text-sm text-center">
            {d.learnSomethingNew || "new process"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

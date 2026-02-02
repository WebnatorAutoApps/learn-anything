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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="mt-6">
      <View className="flex-row flex-wrap gap-4">
        {courses.map((course) => (
          <Pressable
            key={course.id}
            onPress={() => router.push(`/(app)/course/${course.id}`)}
            className="bg-theme-surface border border-theme-border rounded-lg p-4 flex-1 min-w-[160px] max-w-[300px]"
          >
            <View className="h-10 w-10 rounded-lg bg-theme-primary-dim items-center justify-center mb-3">
              <Text className="text-theme-primary font-bold text-lg">
                {course.normalized_title.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text
              className="text-theme-secondary font-medium text-sm mb-1"
              numberOfLines={2}
            >
              {course.normalized_title}
            </Text>
            <Text className="text-theme-muted text-xs">
              {course.total_modules} modules
            </Text>
          </Pressable>
        ))}

        <Pressable
          onPress={onLearnClick}
          className="bg-theme-surface border border-dashed border-theme-border rounded-lg p-4 flex-1 min-w-[160px] max-w-[300px] items-center justify-center"
        >
          <View className="h-10 w-10 rounded-full border border-theme-border items-center justify-center mb-3">
            <Text className="text-theme-primary text-xl">+</Text>
          </View>
          <Text className="text-theme-muted text-sm text-center">
            {d.learnSomethingNew || "Learn Something New"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

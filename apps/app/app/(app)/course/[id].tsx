import React from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCourseDetail, ERROR_MESSAGES } from "@learn-anything/shared";
import { useI18n } from "../../../src/i18n/I18nProvider";
import { Button } from "../../../src/components/ui";
import { EnrolledView, UnenrolledView } from "../../../src/components/course";

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

  if (isLoading) {
    return (
      <View className="flex-1 bg-theme-bg items-center justify-center">
        <Text className="font-mono text-base text-theme-muted animate-blink">
          {cr.loadingCourse || "Loading course data..."}
        </Text>
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
        <Text className="font-mono text-theme-error text-base mb-4">
          {(t.errors as Record<string, string>).errorPrefix || "ERROR:"} {errorMessage}
        </Text>
        <Button onPress={() => router.back()}>
          {cr.backToDashboard || "Back to Dashboard"}
        </Button>
      </View>
    );
  }

  const { course, isEnrolled, isOwner } = data;

  if (isEnrolled) {
    return (
      <EnrolledView
        course={course}
        onBack={() => router.back()}
        labels={cr}
        commonLabels={c}
      />
    );
  }

  return (
    <UnenrolledView
      course={course}
      isOwner={isOwner}
      onBack={() => router.back()}
      labels={cr}
      commonLabels={c}
    />
  );
}

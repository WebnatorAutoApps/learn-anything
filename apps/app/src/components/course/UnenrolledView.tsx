import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import {
  useEnrollCourse,
  CADENCE_OPTIONS,
  validateCommitment,
} from "@learn-anything/shared";
import type { CourseDetail, Module } from "@learn-anything/shared";
import { Button } from "../ui";
import CourseHeader from "./CourseHeader";
import InfoCard from "./InfoCard";

interface UnenrolledViewProps {
  course: CourseDetail;
  isOwner: boolean;
  onBack: () => void;
  labels: Record<string, string>;
  commonLabels: Record<string, string>;
}

export default function UnenrolledView({
  course,
  isOwner,
  onBack,
  labels,
  commonLabels,
}: UnenrolledViewProps) {
  const enrollMutation = useEnrollCourse();
  const [commitmentIntervalDays, setCommitmentIntervalDays] = useState(3);

  const commitment = validateCommitment(
    course.total_modules,
    commitmentIntervalDays
  );

  async function handleEnroll() {
    if (!commitment.valid) return;
    try {
      await enrollMutation.mutateAsync({
        courseId: course.id,
        isOwner,
        commitmentIntervalDays,
      });
    } catch {
      // error handled by mutation
    }
  }

  const cadenceKeys: Record<number, string> = {
    1: "cadenceDaily",
    2: "cadenceEvery2Days",
    3: "cadenceEvery3Days",
    5: "cadenceEvery5Days",
    7: "cadenceWeekly",
    14: "cadenceBiweekly",
    30: "cadenceMonthly",
  };

  return (
    <View className="flex-1 bg-theme-bg">
      <CourseHeader
        title={course.normalized_title}
        isEnrolled={false}
        onBack={onBack}
        labels={{
          back: commonLabels.back || "back",
          info: "INFO",
          quit: "QUIT",
        }}
      />

      <ScrollView className="flex-1 px-4 py-6">
        {/* Title */}
        <View className="flex-row items-center mb-1">
          <Text className="font-mono text-xl text-theme-primary">{"$ "}</Text>
          <Text className="font-mono text-xl font-bold text-theme-primary">
            {course.normalized_title}
          </Text>
        </View>

        {/* Description */}
        <Text className="font-mono text-theme-secondary text-base mt-2 mb-1">
          {course.learning_goal}
        </Text>
        <Text className="font-mono text-theme-muted text-sm mb-6 leading-relaxed">
          {"// "}{course.learning_goal_details}
        </Text>

        {/* Info Grid */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          <InfoCard label="STEPS" value={String(course.total_modules)} />
          <InfoCard label="LEVEL" value={course.expertise_level} />
          <InfoCard label="TARGET" value={course.expected_skill_level} />
          <InfoCard label="PROB" value={`${course.likelihood_of_learning}%`} />
        </View>

        {/* Expertise details */}
        {course.expertise_details && (
          <View className="border border-theme-primary/20 bg-theme-bg p-3 mb-6">
            <Text className="font-mono text-sm text-theme-muted uppercase tracking-wider mb-1">
              {">"} {labels.yourBackground || "BACKGROUND"}
            </Text>
            <Text className="font-mono text-theme-secondary text-sm leading-relaxed">
              {course.expertise_details}
            </Text>
          </View>
        )}

        {/* Commitment Selection */}
        <View className="mb-6">
          <Text className="font-mono text-sm text-theme-muted uppercase tracking-wider mb-2">
            {">"} {labels.studyCadence || "STUDY CADENCE"}
          </Text>
          <Text className="font-mono text-sm text-theme-muted mb-3">
            {"// "}{labels.questionCommitment || "How often can you dedicate time to this?"}
          </Text>

          <View className="gap-1 mb-4">
            {CADENCE_OPTIONS.map((opt, i) => {
              const optValidation = validateCommitment(
                course.total_modules,
                opt.value
              );
              const isSelected = commitmentIntervalDays === opt.value;
              const isDisabled = !optValidation.valid;
              const label = labels[cadenceKeys[opt.value]] || opt.label;

              return (
                <Pressable
                  key={opt.value}
                  onPress={() =>
                    !isDisabled && setCommitmentIntervalDays(opt.value)
                  }
                  className={`flex-row items-center justify-between px-3 py-2 border ${
                    isSelected
                      ? "border-theme-primary bg-theme-primary-faint"
                      : isDisabled
                      ? "border-theme-primary/10 opacity-40"
                      : "border-theme-primary/20"
                  }`}
                  disabled={isDisabled}
                >
                  <View className="flex-row items-center gap-2">
                    <Text
                      className={`font-mono text-sm ${
                        isDisabled ? "text-theme-muted" : "text-theme-primary"
                      }`}
                    >
                      [{String(i + 1).padStart(2, "0")}]
                    </Text>
                    <Text
                      className={`font-mono text-sm ${
                        isSelected
                          ? "text-theme-primary font-bold"
                          : isDisabled
                          ? "text-theme-muted"
                          : "text-theme-secondary"
                      }`}
                    >
                      {label}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    {!isDisabled && (
                      <Text className="font-mono text-xs text-theme-muted">
                        ~{optValidation.projectedDays}d
                      </Text>
                    )}
                    {isSelected && (
                      <Text className="font-mono text-sm text-theme-primary font-bold">
                        * ACTIVE
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Validation feedback */}
          {!commitment.valid && (
            <View className="border border-theme-warning/30 bg-theme-warning/10 p-3 mb-4">
              <Text className="font-mono text-sm text-theme-warning mb-1">
                {">"} WARNING
              </Text>
              {commitment.suggestedIntervalDays ? (
                <Text className="font-mono text-sm text-theme-muted leading-relaxed">
                  {"// "}
                  {(
                    labels.paceWarning ||
                    "Commitments over 1 year rarely lead to completion. Choose a pace of every {days} day(s) or more frequent to enroll."
                  ).replace("{days}", String(commitment.suggestedIntervalDays))}
                </Text>
              ) : (
                <Text className="font-mono text-sm text-theme-muted leading-relaxed">
                  {"// "}
                  {(
                    labels.tooManyStepsDetail ||
                    "With {n} steps, even a daily commitment would take ~{years} years. This path cannot be completed within 1 year at any pace."
                  )
                    .replace("{n}", String(course.total_modules))
                    .replace("{years}", String(commitment.projectedYears))}
                </Text>
              )}
            </View>
          )}

          {commitment.valid && (
            <View className="border border-theme-primary/20 p-3 mb-4">
              <Text className="font-mono text-sm text-theme-muted">
                {"// "}Projected completion: ~{commitment.projectedDays} days (
                {commitment.projectedYears} yr)
              </Text>
            </View>
          )}

          <Button
            onPress={handleEnroll}
            loading={enrollMutation.isPending}
            disabled={!commitment.valid}
          >
            {labels.enrollNow || "ENROLL NOW"}
          </Button>
        </View>

        {/* Module Preview */}
        {course.modules.length > 0 && (
          <View className="gap-2 mb-8">
            <Text className="font-mono text-theme-muted text-sm mb-2">
              {">"} {labels.learningPathSteps || "EXECUTION STEPS"}
            </Text>
            {course.modules.map((mod, i) => (
              <ModulePreviewCard key={mod.id} mod={mod} index={i} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ModulePreviewCard({ mod, index }: { mod: Module; index: number }) {
  return (
    <View className="border p-3 border-theme-primary/10">
      <View className="flex-row items-center gap-3">
        <Text className="font-mono text-sm text-theme-primary">
          [{String(index + 1).padStart(2, "0")}]
        </Text>
        <Text className="font-mono text-theme-secondary text-base flex-1">
          {mod.title}
        </Text>
      </View>
    </View>
  );
}

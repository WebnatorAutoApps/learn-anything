import React from "react";
import { View, Text } from "react-native";
import { useI18n } from "../../i18n/I18nProvider";
import { Modal } from "../ui";
import type { CourseDetail } from "@learn-anything/shared";
import InfoCard from "./InfoCard";

interface PathDetailModalProps {
  visible: boolean;
  onClose: () => void;
  course: CourseDetail;
  labels: {
    background: string;
    studyCadence: string;
  };
}

function formatCadence(days: number | null, cr: Record<string, string>): string {
  if (!days) return "—";
  if (days === 1) return cr.cadenceDaily || "Daily";
  if (days === 7) return cr.cadenceWeekly || "Weekly";
  if (days === 14) return cr.cadenceBiweekly || "Biweekly";
  if (days === 30) return cr.cadenceMonthly || "Monthly";
  return (cr.studyCadenceEvery || "Every {days} day(s)").replace("{days}", String(days));
}

export default function PathDetailModal({
  visible,
  onClose,
  course,
  labels,
}: PathDetailModalProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;

  return (
    <Modal visible={visible} onClose={onClose} title={cr.pathDetails || "PATH DETAILS"}>
      <View className="flex-row items-center mb-1">
        <Text className="font-mono text-lg text-theme-primary">{"$ "}</Text>
        <Text className="font-mono text-lg font-bold text-theme-primary">
          {course.normalized_title}
        </Text>
      </View>

      <Text className="font-mono text-theme-secondary text-base mt-2 mb-1">
        {course.learning_goal}
      </Text>
      <Text className="font-mono text-theme-muted text-sm mb-4 leading-relaxed">
        {"// "}{course.learning_goal_details}
      </Text>

      <View className="flex-row gap-2 mb-2">
        <InfoCard label={cr.stepsLabel || "STEPS"} value={String(course.total_modules)} />
        <InfoCard label={cr.yourLevel || "LEVEL"} value={course.expertise_level} />
      </View>
      <View className="flex-row gap-2 mb-4">
        <InfoCard label={cr.targetLevel || "TARGET"} value={course.expected_skill_level} />
        <InfoCard label={cr.prob || "PROB"} value={`${course.likelihood_of_learning}%`} />
      </View>

      {course.expertise_details && (
        <View className="border border-theme-primary/20 bg-theme-bg p-3 mb-4">
          <Text className="font-mono text-sm text-theme-muted uppercase tracking-wider mb-1">
            {">"} {labels.background}
          </Text>
          <Text className="font-mono text-theme-secondary text-sm leading-relaxed">
            {course.expertise_details}
          </Text>
        </View>
      )}

      <View className="border border-theme-primary/20 bg-theme-bg p-3">
        <Text className="font-mono text-sm text-theme-muted uppercase tracking-wider mb-1">
          {">"} {labels.studyCadence}
        </Text>
        <Text className="font-mono text-theme-secondary text-sm">
          {formatCadence(course.commitment_interval_days, cr)}
        </Text>
      </View>
    </Modal>
  );
}

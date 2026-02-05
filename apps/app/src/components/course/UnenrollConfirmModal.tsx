import React from "react";
import { View, Text } from "react-native";
import { useI18n } from "../../i18n/I18nProvider";
import { Button, Modal } from "../ui";

interface UnenrollConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  completedCount: number;
  totalCount: number;
  progressPct: number;
  onConfirm: () => void;
  isLoading: boolean;
  labels: {
    keepGoing: string;
    quitAnyway: string;
  };
}

export default function UnenrollConfirmModal({
  visible,
  onClose,
  title,
  completedCount,
  totalCount,
  progressPct,
  onConfirm,
  isLoading,
  labels,
}: UnenrollConfirmModalProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;

  return (
    <Modal visible={visible} onClose={onClose} title={cr.unenroll || "UNENROLL"}>
      <Text className="font-mono text-base text-theme-secondary mb-2">
        {">"} {title}
      </Text>

      {progressPct > 0 && (
        <View className="border border-theme-primary/20 bg-theme-surface p-2 mb-3">
          <Text className="font-mono text-sm text-theme-primary">
            {cr.progressLabel || "PROGRESS"}: [{completedCount}/{totalCount}] {progressPct}%
          </Text>
          <View className="h-1.5 bg-theme-bg mt-1">
            <View
              className="h-full bg-theme-primary"
              style={{ width: `${progressPct}%` }}
            />
          </View>
        </View>
      )}

      <Text className="font-mono text-sm text-theme-muted leading-relaxed mb-1">
        {"// "}{cr.motivationalQuote1 || "Every expert was once a beginner who refused to quit."}
      </Text>
      <Text className="font-mono text-sm text-theme-muted leading-relaxed mb-1">
        {"// "}
        {progressPct > 0
          ? (cr.someProgressWarning || "You've already completed {pct}% — that effort will be lost.").replace("{pct}", String(progressPct))
          : (cr.noProgressMessage || "You haven't even started yet. Give it a chance.")}
      </Text>
      <Text className="font-mono text-sm text-theme-secondary leading-relaxed mb-4">
        {"// "}{cr.motivationalQuote2 || "The only real failure is the one who stops trying."}
      </Text>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button onPress={onClose}>{labels.keepGoing}</Button>
        </View>
        <View className="flex-1">
          <Button
            variant="danger"
            onPress={onConfirm}
            loading={isLoading}
          >
            {labels.quitAnyway}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

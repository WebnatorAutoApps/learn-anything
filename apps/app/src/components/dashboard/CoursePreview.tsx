import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal as RNModal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../../i18n/I18nProvider";
import { Button } from "../ui";
import type { LLMResponse } from "@learn-anything/shared";
import type { LearningPlanData } from "../../hooks";

interface CoursePreviewProps {
  llmResponse: LLMResponse;
  planData: LearningPlanData;
  onConfirm: () => void;
  onGoBack: () => void;
  isSaving: boolean;
}

export default function CoursePreview({
  llmResponse,
  planData,
  onConfirm,
  onGoBack,
  isSaving,
}: CoursePreviewProps) {
  const { t } = useI18n();
  const p = t.preview as Record<string, string>;
  const insets = useSafeAreaInsets();
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

  function toggleModule(index: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <RNModal visible transparent animationType="slide">
      <View className="flex-1 bg-theme-bg" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-2 border-b border-theme-primary/30 bg-theme-surface">
          <Text className="font-mono text-base font-bold text-theme-primary tracking-wider">
            {">"} {p.title || "PREVIEW"}
          </Text>
          <Pressable onPress={onGoBack} className="py-1">
            <Text className="font-mono text-base text-theme-muted">
              [{p.goBack || "Go Back"}]
            </Text>
          </Pressable>
        </View>

        {/* Body */}
        <ScrollView className="flex-1 px-4 py-4">
          <Text className="font-mono text-sm text-theme-muted mb-4">
            {"// "}{p.subtitle || "Review your generated learning path before saving."}
          </Text>

          {/* Title */}
          <Text className="font-mono text-xl font-bold text-theme-primary mb-4">
            {llmResponse.normalized_title}
          </Text>

          {/* Stats */}
          <View className="border border-theme-primary/20 bg-theme-surface p-3 mb-4">
            <View className="gap-1">
              <StatRow label={p.expectedLevel || "Expected Level"} value={llmResponse.expected_skill_level} />
              <StatRow label={p.likelihood || "Likelihood"} value={`${llmResponse.likelihood_of_learning}%`} />
              <StatRow label={p.modules || "Modules"} value={String(llmResponse.program.length)} />
            </View>
          </View>

          {/* Module List */}
          {llmResponse.program.map((mod) => {
            const isExpanded = expandedModules.has(mod.module_index);
            return (
              <View key={mod.module_index} className="mb-3">
                <Pressable
                  onPress={() => toggleModule(mod.module_index)}
                  className="border border-theme-primary/20 bg-theme-surface p-3"
                >
                  <View className="flex-row items-center">
                    <Text className="font-mono text-sm text-theme-primary mr-2">
                      [{String(mod.module_index).padStart(2, "0")}]
                    </Text>
                    <Text className="font-mono text-sm font-bold text-theme-secondary flex-1">
                      {mod.module_title}
                    </Text>
                    <Text className="font-mono text-sm text-theme-muted">
                      {isExpanded ? "[-]" : "[+]"}
                    </Text>
                  </View>
                  <Text className="font-mono text-xs text-theme-muted mt-1 ml-8">
                    {mod.module_description}
                  </Text>
                </Pressable>

                {isExpanded && (
                  <View className="border-l border-r border-b border-theme-primary/10 bg-theme-bg px-3 py-2">
                    {mod.projects.map((proj, projIdx) => (
                      <View key={projIdx} className="mb-3 last:mb-0">
                        <Text className="font-mono text-xs text-theme-primary mb-1">
                          {p.projectOption || "Option"} {projIdx + 1}: {proj.project_title}
                        </Text>
                        <Text className="font-mono text-xs text-theme-muted mb-1">
                          {proj.instructions}
                        </Text>
                        <Text className="font-mono text-xs text-theme-secondary">
                          {p.objective || "Objective"}: {proj.objective}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Footer */}
        <View
          className="px-4 py-3 border-t border-theme-primary/30 bg-theme-surface flex-row gap-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-1">
            <Button variant="secondary" onPress={onGoBack} disabled={isSaving}>
              {p.goBack || "Go Back"}
            </Button>
          </View>
          <View className="flex-1">
            <Button onPress={onConfirm} loading={isSaving}>
              {isSaving ? (p.saving || "Saving...") : (p.confirm || "Confirm & Save")}
            </Button>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row">
      <Text className="font-mono text-sm text-theme-muted w-36">{label}:</Text>
      <Text className="font-mono text-sm text-theme-secondary flex-1">{value}</Text>
    </View>
  );
}

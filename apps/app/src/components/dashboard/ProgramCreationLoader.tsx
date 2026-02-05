import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Modal as RNModal } from "react-native";
import {
  LOADING_MESSAGE_KEYS,
  EXTENDED_WAIT_KEY,
  MESSAGE_ROTATION_INTERVAL_MS,
  EXTENDED_WAIT_THRESHOLD_MS,
} from "@learn-anything/shared";
import { useI18n } from "../../i18n/I18nProvider";
import { Button } from "../ui";

interface ProgramCreationLoaderProps {
  error?: string | null;
  errorKey?: string | null;
  canRetry?: boolean;
  onRetry?: () => void;
  onDismissError: () => void;
}

export default function ProgramCreationLoader({
  error,
  errorKey,
  canRetry,
  onRetry,
  onDismissError,
}: ProgramCreationLoaderProps) {
  const { t } = useI18n();
  const loading = t.loading as Record<string, string>;
  const errors = t.errors as Record<string, string>;

  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * LOADING_MESSAGE_KEYS.length)
  );
  const [showExtendedWait, setShowExtendedWait] = useState(false);

  const hasError = !!(error || errorKey);

  useEffect(() => {
    if (hasError) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * LOADING_MESSAGE_KEYS.length);
        }
        return next;
      });
    }, MESSAGE_ROTATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [hasError]);

  useEffect(() => {
    if (hasError) return;

    const timeout = setTimeout(() => {
      setShowExtendedWait(true);
    }, EXTENDED_WAIT_THRESHOLD_MS);

    return () => clearTimeout(timeout);
  }, [hasError]);

  if (hasError) {
    const displayMessage = errorKey
      ? (errors[errorKey] || errors.generic || error)
      : error;

    return (
      <RNModal visible transparent animationType="fade">
        <View className="flex-1 items-center justify-center px-6 bg-theme-bg">
          <View className="w-full max-w-md border border-theme-error/30 bg-theme-bg p-6">
            <Text className="font-mono text-base text-theme-error font-bold mb-2">
              {">"} ERROR
            </Text>
            <Text className="font-mono text-sm text-theme-error mb-4">
              {errors.somethingWentWrong || "Something went wrong"}
            </Text>
            <Text className="font-mono text-sm text-theme-muted mb-6 leading-relaxed">
              {"// "}{displayMessage}
            </Text>
            <View className="flex-row gap-3">
              {canRetry && onRetry && (
                <View className="flex-1">
                  <Button onPress={onRetry}>
                    {errors.retrySubmission || "RETRY"}
                  </Button>
                </View>
              )}
              <View className="flex-1">
                <Button variant={canRetry ? "secondary" : "danger"} onPress={onDismissError}>
                  {errors.goBack || "GO_BACK"}
                </Button>
              </View>
            </View>
          </View>
        </View>
      </RNModal>
    );
  }

  return (
    <RNModal visible transparent animationType="fade">
      <View className="flex-1 items-center justify-center px-6 bg-theme-bg">
        <View className="items-center max-w-lg">
          <Text className="font-mono text-xl text-theme-primary animate-blink mb-6">
            [{loading.generating || "GENERATING"}]
          </Text>

          <Text className="font-mono text-base text-theme-primary text-center mb-4 leading-relaxed">
            {loading[LOADING_MESSAGE_KEYS[messageIndex]]}
          </Text>

          <View className="flex-row gap-1 mb-6">
            <Text className="font-mono text-theme-primary animate-blink">.</Text>
            <Text className="font-mono text-theme-primary animate-blink">.</Text>
            <Text className="font-mono text-theme-primary animate-blink">.</Text>
          </View>

          {showExtendedWait && (
            <Text className="font-mono text-sm text-theme-muted">
              {"// "}{loading[EXTENDED_WAIT_KEY]}
            </Text>
          )}
        </View>
      </View>
    </RNModal>
  );
}

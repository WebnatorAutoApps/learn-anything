import React from "react";
import { View, Text } from "react-native";
import { Modal, Button } from "../ui";

interface ApiKeyWarningDialogProps {
  onGoToSettings: () => void;
  onCancel: () => void;
}

export default function ApiKeyWarningDialog({
  onGoToSettings,
  onCancel,
}: ApiKeyWarningDialogProps) {
  return (
    <Modal visible onClose={onCancel} title="API_KEY_REQUIRED">
      <Text className="font-mono text-base text-theme-secondary mb-2">
        {">"} Gemini API key not configured.
      </Text>
      <Text className="font-mono text-sm text-theme-muted mb-4">
        {"// "}Navigate to Settings {">"} API_KEYS to add your key.
      </Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button variant="secondary" onPress={onCancel}>
            CANCEL
          </Button>
        </View>
        <View className="flex-1">
          <Button onPress={onGoToSettings}>
            SETTINGS
          </Button>
        </View>
      </View>
    </Modal>
  );
}

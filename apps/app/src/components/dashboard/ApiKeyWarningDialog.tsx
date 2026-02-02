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
    <Modal visible onClose={onCancel} title="API Key Required">
      <Text className="text-theme-secondary text-sm mb-2">
        You need to set up a Gemini API key before creating a learning path.
      </Text>
      <Text className="text-theme-muted text-xs mb-4">
        Go to Settings → API Keys to add your key.
      </Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button variant="secondary" onPress={onCancel}>
            Cancel
          </Button>
        </View>
        <View className="flex-1">
          <Button onPress={onGoToSettings}>
            Go to Settings
          </Button>
        </View>
      </View>
    </Modal>
  );
}

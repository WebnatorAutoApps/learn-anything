import React from "react";
import { View, Text } from "react-native";
import { useI18n } from "../../i18n/I18nProvider";
import { Modal, Button } from "../ui";

interface ApiKeyWarningDialogProps {
  onGoToSettings: () => void;
  onCancel: () => void;
}

export default function ApiKeyWarningDialog({
  onGoToSettings,
  onCancel,
}: ApiKeyWarningDialogProps) {
  const { t } = useI18n();
  const dlg = t.dialogs as Record<string, string>;
  const c = t.common as Record<string, string>;
  const h = t.header as Record<string, string>;

  return (
    <Modal visible onClose={onCancel} title={dlg.apiKeyRequired || "API_KEY_REQUIRED"}>
      <Text className="font-mono text-base text-theme-secondary mb-2">
        {">"} {dlg.apiKeyWarning || "Gemini API key not configured."}
      </Text>
      <Text className="font-mono text-sm text-theme-muted mb-4">
        {"// "}{dlg.goToSettings || "Navigate to Settings > API_KEYS to add your key."}
      </Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button variant="secondary" onPress={onCancel}>
            {c.cancel || "CANCEL"}
          </Button>
        </View>
        <View className="flex-1">
          <Button onPress={onGoToSettings}>
            {h.settings || "SETTINGS"}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

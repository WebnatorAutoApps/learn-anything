import React from "react";
import { View, Text } from "react-native";
import { useI18n } from "../../i18n/I18nProvider";
import { Modal, Button } from "../ui";

interface LogoutConfirmDialogProps {
  isLoggingOut: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmDialog({
  isLoggingOut,
  onConfirm,
  onCancel,
}: LogoutConfirmDialogProps) {
  const { t } = useI18n();
  const dlg = t.dialogs as Record<string, string>;
  const c = t.common as Record<string, string>;

  return (
    <Modal visible onClose={onCancel} title={dlg.confirmLogout || "LOGOUT"}>
      <Text className="font-mono text-base text-theme-secondary mb-4">
        {"// "}{dlg.logoutMessage || "Are you sure you want to terminate this session?"}
      </Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button variant="secondary" onPress={onCancel}>
            {c.cancel || "CANCEL"}
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="danger" onPress={onConfirm} loading={isLoggingOut}>
            {c.confirm || "CONFIRM"}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

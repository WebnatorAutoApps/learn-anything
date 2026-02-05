import React from "react";
import { View, Text } from "react-native";
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
  return (
    <Modal visible onClose={onCancel} title="LOGOUT">
      <Text className="font-mono text-base text-theme-secondary mb-4">
        {"// "}Are you sure you want to terminate this session?
      </Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button variant="secondary" onPress={onCancel}>
            CANCEL
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="danger" onPress={onConfirm} loading={isLoggingOut}>
            CONFIRM
          </Button>
        </View>
      </View>
    </Modal>
  );
}

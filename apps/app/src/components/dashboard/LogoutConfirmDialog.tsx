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
    <Modal visible onClose={onCancel} title="Log Out">
      <Text className="text-theme-secondary text-sm mb-4">
        Are you sure you want to log out?
      </Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button variant="secondary" onPress={onCancel}>
            Cancel
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="danger" onPress={onConfirm} loading={isLoggingOut}>
            Log Out
          </Button>
        </View>
      </View>
    </Modal>
  );
}

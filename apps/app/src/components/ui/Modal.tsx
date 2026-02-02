import React from "react";
import { View, Text, Pressable, Modal as RNModal, ScrollView } from "react-native";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 items-center justify-center px-4">
        <View className="w-full max-w-lg bg-theme-surface border border-theme-border rounded-xl overflow-hidden">
          {title && (
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-theme-border">
              <Text className="text-theme-secondary text-lg font-semibold">
                {title}
              </Text>
              <Pressable onPress={onClose} className="p-1">
                <Text className="text-theme-muted text-xl">✕</Text>
              </Pressable>
            </View>
          )}
          <ScrollView className="max-h-96">
            <View className="p-5">{children}</View>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

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
      <View className="flex-1 bg-theme-bg/90 items-center justify-center px-4">
        <View className="w-full max-w-lg bg-theme-bg border border-theme-primary/30 overflow-hidden">
          {title && (
            <View className="flex-row items-center justify-between px-4 py-2 border-b border-theme-primary/30 bg-theme-surface">
              <Text className="font-mono text-base font-bold text-theme-primary tracking-wider">
                {">"} {title}
              </Text>
              <Pressable onPress={onClose} className="py-1">
                <Text className="font-mono text-base text-theme-muted">[ESC]</Text>
              </Pressable>
            </View>
          )}
          <ScrollView className="max-h-96">
            <View className="p-4">{children}</View>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

import React from "react";
import { View, Text } from "react-native";

interface InfoCardProps {
  label: string;
  value: string;
}

export default function InfoCard({ label, value }: InfoCardProps) {
  return (
    <View className="border border-theme-primary/20 bg-theme-bg p-2 flex-1 min-w-[100px]">
      <Text className="font-mono text-xs text-theme-muted uppercase tracking-wider mb-0.5">
        {label}
      </Text>
      <Text className="font-mono text-base font-bold text-theme-primary">
        {value}
      </Text>
    </View>
  );
}

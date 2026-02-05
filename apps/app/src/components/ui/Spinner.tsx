import React from "react";
import { ActivityIndicator } from "react-native";

interface SpinnerProps {
  size?: "small" | "large";
  color?: string;
}

export default function Spinner({ size = "small", color }: SpinnerProps) {
  return <ActivityIndicator size={size} color={color ?? "var(--t-primary)"} />;
}

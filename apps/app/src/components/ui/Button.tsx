import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  primary: "bg-theme-accent",
  secondary: "border border-theme-border bg-transparent",
  danger: "border border-theme-error bg-transparent",
} as const;

const textVariantClasses = {
  primary: "text-theme-text-on-accent font-semibold",
  secondary: "text-theme-secondary",
  danger: "text-theme-error",
} as const;

const sizeClasses = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2.5",
} as const;

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
} as const;

export default function Button({
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  children,
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`rounded-lg items-center justify-center flex-row ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? "opacity-30" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "var(--t-text-on-accent)" : "var(--t-secondary)"}
        />
      ) : typeof children === "string" ? (
        <Text className={`${textVariantClasses[variant]} ${textSizeClasses[size]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

import React from "react";
import { Redirect, Slot } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";
import { ActivityIndicator, View } from "react-native";

export default function AuthLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-theme-bg">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Authenticated users redirect to the app
  if (session) {
    return <Redirect href="/(app)" />;
  }

  return <Slot />;
}

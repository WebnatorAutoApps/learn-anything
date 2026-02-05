import "../global.css";
import React from "react";
import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, Platform, LogBox } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { setSupabaseClient, setStorageAdapter, GeminiKeyProvider } from "@learn-anything/shared";
import { AuthProvider } from "../src/auth/AuthProvider";
import { ThemeProvider, useTheme } from "../src/theme/ThemeProvider";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { supabase } from "../src/lib/supabase";

// Suppress deprecated SafeAreaView warning from react-native-screens
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

// Initialize shared package with Supabase client
setSupabaseClient(supabase);

const webStorage = {
  getItem: async (key: string) => {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  },
};

if (Platform.OS === "web") {
  setStorageAdapter(webStorage);
} else {
  // Lazy-load SecureStore for native
  import("expo-secure-store").then((SecureStore) => {
    setStorageAdapter({
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    });
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
});

function ThemedContainer({ children }: { children: React.ReactNode }) {
  const { themeVars } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, paddingTop: insets.top }, themeVars]} className="bg-theme-bg">
      {children}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GeminiKeyProvider>
            <ThemeProvider>
              <I18nProvider>
                <ThemedContainer>
                  <StatusBar style="light" />
                  <Slot />
                </ThemedContainer>
              </I18nProvider>
            </ThemeProvider>
          </GeminiKeyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

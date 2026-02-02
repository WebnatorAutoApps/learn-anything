import "../global.css";
import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View } from "react-native";
import { setApiBaseUrl, setAuthTokenProvider, setStorageAdapter } from "@learn-anything/shared";
import { AuthProvider } from "../src/auth/AuthProvider";
import { ThemeProvider, useTheme } from "../src/theme/ThemeProvider";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { supabase } from "../src/lib/supabase";
import { Platform } from "react-native";

// Initialize shared package
setApiBaseUrl(process.env.EXPO_PUBLIC_API_URL ?? "");

setAuthTokenProvider(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
});

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
  return (
    <View style={[{ flex: 1 }, themeVars]}>
      {children}
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <I18nProvider>
            <ThemedContainer>
              <Slot />
            </ThemedContainer>
          </I18nProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

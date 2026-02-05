import React, { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";
import { useI18n } from "../../src/i18n/I18nProvider";
import { Button, Input, GoogleIcon } from "../../src/components/ui";

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const a = t.auth as Record<string, string>;
  const c = t.common as Record<string, string>;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      }
    } catch {
      setError(a.invalidCredentials || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-theme-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-1 items-center justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-sm">
          <Text className="text-2xl font-semibold text-theme-secondary text-center mb-8">
            {a.signInTitle || "Sign in to Learn Anything"}
          </Text>

          <Pressable
            onPress={handleGoogleLogin}
            className="w-full rounded-lg border border-theme-border bg-theme-surface px-4 py-3 flex-row items-center justify-center gap-2"
          >
            <GoogleIcon size={20} />
            <Text className="text-theme-secondary text-sm font-medium">
              {a.signInGoogle || "Sign in with Google"}
            </Text>
          </Pressable>

          <View className="my-6 flex-row items-center">
            <View className="flex-1 h-px bg-theme-border" />
            <Text className="px-3 text-sm text-theme-muted">
              {c.or || "or"}
            </Text>
            <View className="flex-1 h-px bg-theme-border" />
          </View>

          {error ? (
            <View className="rounded-lg bg-theme-error/20 border border-theme-error p-3 mb-4">
              <Text className="text-sm text-theme-error">{error}</Text>
            </View>
          ) : null}

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-theme-secondary mb-1">
                {a.email || "Email"}
              </Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder={a.emailPlaceholder || "Enter your email"}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-theme-secondary mb-1">
                {a.password || "Password"}
              </Text>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder={a.passwordPlaceholder || "Enter your password"}
                secureTextEntry
              />
            </View>

            <Button
              onPress={handleLogin}
              loading={isLoading}
              disabled={!email || !password}
            >
              {isLoading
                ? (a.signingIn || "Signing in...")
                : (a.signIn || "Sign in")}
            </Button>
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-theme-muted">
              {a.noAccount || "Don't have an account?"}{" "}
            </Text>
            <Link href="/(auth)/signup">
              <Text className="text-sm font-medium text-theme-primary">
                {a.signUp || "Sign up"}
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

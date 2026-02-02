import React, { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";
import { useI18n } from "../../src/i18n/I18nProvider";
import { Button, Input } from "../../src/components/ui";

export default function SignupScreen() {
  const { signUp, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const a = t.auth as Record<string, string>;
  const c = t.common as Record<string, string>;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup() {
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const result = await signUp(email, password, fullName);
      if (result.error) {
        setError(result.error);
      } else if (result.requiresConfirmation) {
        setMessage("Check your email to confirm your account.");
      }
    } catch {
      setError(a.createAccountFailed || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignup() {
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
            {a.createAccount || "Create your account"}
          </Text>

          <Pressable
            onPress={handleGoogleSignup}
            className="w-full rounded-lg border border-theme-border bg-theme-surface px-4 py-3 flex-row items-center justify-center"
          >
            <Text className="text-theme-secondary text-sm font-medium">
              {a.signUpGoogle || "Sign up with Google"}
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
            <View className="rounded-lg bg-red-900/20 border border-red-800 p-3 mb-4">
              <Text className="text-sm text-red-400">{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View className="rounded-lg bg-green-900/20 border border-green-800 p-3 mb-4">
              <Text className="text-sm text-green-400">{message}</Text>
            </View>
          ) : null}

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-theme-secondary mb-1">
                {a.fullName || "Full Name"}
              </Text>
              <Input
                value={fullName}
                onChangeText={setFullName}
                placeholder={a.fullNamePlaceholder || "Enter your full name"}
                autoCapitalize="words"
              />
            </View>

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
                placeholder={a.createPasswordPlaceholder || "Create a password (min 6 characters)"}
                secureTextEntry
              />
            </View>

            <Button
              onPress={handleSignup}
              loading={isLoading}
              disabled={!email || !password || !fullName}
            >
              {isLoading
                ? (a.creatingAccount || "Creating account...")
                : (a.createAccountBtn || "Create account")}
            </Button>
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-theme-muted">
              {a.hasAccount || "Already have an account?"}{" "}
            </Text>
            <Link href="/(auth)/login">
              <Text className="text-sm font-medium text-theme-primary">
                {a.signIn || "Sign in"}
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

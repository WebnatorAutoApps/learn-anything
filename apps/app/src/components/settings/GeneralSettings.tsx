import React, { useState } from "react";
import { View, Text, Pressable, Image, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  useProfile,
  useUpdateProfile,
  useUpdateUsername,
  useUpdateEmail,
  useUpdatePassword,
  useUploadAvatar,
} from "@learn-anything/shared";
import type { FeedbackMessage } from "@learn-anything/shared";
import { useI18n } from "../../i18n/I18nProvider";
import { Button, Input } from "../ui";

export default function GeneralSettings() {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const { data: profile } = useProfile();

  return (
    <View className="gap-6">
      <AvatarSection />
      <UsernameSection />
      <DisplayNameSection />
      {profile?.auth_provider === "email" && <PasswordSection />}
    </View>
  );
}

function AvatarSection() {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const { data: profile } = useProfile();
  const uploadAvatar = useUploadAvatar();
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setMessage(null);

    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      await uploadAvatar.mutateAsync(blob);
      setMessage({ type: "success", text: s.profilePictureUpdated || "Profile picture updated." });
    } catch {
      setMessage({ type: "error", text: "Failed to upload image." });
    }
  }

  return (
    <View>
      <Text className="text-sm font-medium text-theme-secondary mb-2">
        {s.profilePicture || "Profile Picture"}
      </Text>
      <Pressable
        onPress={handlePickImage}
        className="h-20 w-20 rounded-full bg-theme-primary-dim items-center justify-center overflow-hidden border-2 border-theme-border"
      >
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            className="h-20 w-20 rounded-full"
          />
        ) : (
          <Text className="text-theme-primary text-2xl font-bold">
            {(profile?.full_name || "").charAt(0).toUpperCase()}
          </Text>
        )}
      </Pressable>
      <Text className="text-xs text-theme-muted mt-1">
        {s.avatarHelp || "JPEG, PNG, or WebP. Max 5 MB."}
      </Text>
      {message && (
        <Text className={`text-xs mt-1 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </Text>
      )}
    </View>
  );
}

function UsernameSection() {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const { data: profile } = useProfile();
  const updateUsername = useUpdateUsername();
  const [username, setUsername] = useState(profile?.username || "");
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  async function handleSave() {
    setMessage(null);
    try {
      await updateUsername.mutateAsync({ username });
      setMessage({ type: "success", text: s.usernameUpdated || "Username updated." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update username." });
    }
  }

  return (
    <View>
      <Text className="text-sm font-medium text-theme-secondary mb-1">
        {s.changeUsername || "Change Username"}
      </Text>
      <Text className="text-xs text-theme-muted mb-2">
        {s.usernameHelp || "3-39 characters. Lowercase letters, numbers, and hyphens only."}
      </Text>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        <Button size="sm" onPress={handleSave} loading={updateUsername.isPending}>
          {(t.common as Record<string, string>)?.save || "Save"}
        </Button>
      </View>
      {message && (
        <Text className={`text-xs mt-1 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </Text>
      )}
    </View>
  );
}

function DisplayNameSection() {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState(profile?.full_name || "");
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  async function handleSave() {
    setMessage(null);
    try {
      await updateProfile.mutateAsync({ full_name: displayName });
      setMessage({ type: "success", text: s.displayNameUpdated || "Display name updated." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update." });
    }
  }

  return (
    <View>
      <Text className="text-sm font-medium text-theme-secondary mb-1">
        {s.displayName || "Display Name"}
      </Text>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={s.displayNamePlaceholder || "Your display name"}
          />
        </View>
        <Button size="sm" onPress={handleSave} loading={updateProfile.isPending}>
          {(t.common as Record<string, string>)?.save || "Save"}
        </Button>
      </View>
      {message && (
        <Text className={`text-xs mt-1 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </Text>
      )}
    </View>
  );
}

function PasswordSection() {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const updatePassword = useUpdatePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  async function handleSave() {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setMessage(null);
    try {
      await updatePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setMessage({ type: "success", text: s.passwordUpdated || "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update password." });
    }
  }

  return (
    <View>
      <Text className="text-sm font-medium text-theme-secondary mb-2">
        {s.changePassword || "Change Password"}
      </Text>
      <View className="gap-2">
        <Input
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder={s.currentPasswordPlaceholder || "Current password"}
          secureTextEntry
        />
        <Input
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={s.newPasswordPlaceholder || "New password (min. 6 characters)"}
          secureTextEntry
        />
        <Input
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={s.confirmPasswordPlaceholder || "Confirm new password"}
          secureTextEntry
        />
        <Button
          size="sm"
          onPress={handleSave}
          loading={updatePassword.isPending}
          disabled={!currentPassword || !newPassword || !confirmPassword}
        >
          {s.updatePassword || "Update Password"}
        </Button>
      </View>
      {message && (
        <Text className={`text-xs mt-1 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </Text>
      )}
    </View>
  );
}

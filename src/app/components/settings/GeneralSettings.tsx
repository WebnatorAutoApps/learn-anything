"use client";

import { useState, useRef } from "react";
import {
  useUpdateProfile,
  useUploadAvatar,
  useUpdateEmail,
  useUpdatePassword,
  useUpdateUsername,
  type Profile,
} from "@/lib/hooks/queries";

interface GeneralSettingsProps {
  profile: Profile;
}

type FeedbackMessage = { type: "success" | "error"; text: string } | null;

export default function GeneralSettings({ profile }: GeneralSettingsProps) {
  const isOAuth = profile.auth_provider !== "email";

  // Username
  const [username, setUsername] = useState(profile.username || "");
  const [usernameMessage, setUsernameMessage] = useState<FeedbackMessage>(null);
  const updateUsernameMutation = useUpdateUsername();

  // Display name
  const [displayName, setDisplayName] = useState(profile.full_name || "");
  const [nameMessage, setNameMessage] = useState<FeedbackMessage>(null);
  const updateProfileMutation = useUpdateProfile();

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarMessage, setAvatarMessage] = useState<FeedbackMessage>(null);
  const uploadAvatarMutation = useUploadAvatar();

  // Email
  const [email, setEmail] = useState(profile.email || "");
  const [emailMessage, setEmailMessage] = useState<FeedbackMessage>(null);
  const updateEmailMutation = useUpdateEmail();

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<FeedbackMessage>(null);
  const updatePasswordMutation = useUpdatePassword();

  const userInitial = (profile.full_name || profile.email || "").charAt(0).toUpperCase();

  function validateUsernameFormat(value: string): string | null {
    if (value.length < 3) return "Username must be at least 3 characters.";
    if (value.length > 39) return "Username must be 39 characters or less.";
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value))
      return "Username can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.";
    if (value.includes("--")) return "Username cannot contain consecutive hyphens.";
    return null;
  }

  async function handleUsernameSave() {
    const trimmed = username.trim().toLowerCase();

    if (!trimmed) {
      setUsernameMessage({ type: "error", text: "Username cannot be empty." });
      return;
    }

    if (trimmed === profile.username?.toLowerCase()) {
      setUsernameMessage(null);
      return;
    }

    const formatError = validateUsernameFormat(trimmed);
    if (formatError) {
      setUsernameMessage({ type: "error", text: formatError });
      return;
    }

    setUsernameMessage(null);

    try {
      await updateUsernameMutation.mutateAsync({ username: trimmed });
      setUsername(trimmed);
      setUsernameMessage({ type: "success", text: "Username updated." });
    } catch (err) {
      setUsernameMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update username.",
      });
    }
  }

  async function handleNameSave() {
    if (!displayName.trim()) return;
    setNameMessage(null);

    try {
      await updateProfileMutation.mutateAsync({ full_name: displayName.trim() });
      setNameMessage({ type: "success", text: "Display name updated." });
    } catch (err) {
      setNameMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update display name.",
      });
    }
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarMessage(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarMessage({ type: "error", text: "Invalid file type. Use JPEG, PNG, or WebP." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage({ type: "error", text: "File too large. Maximum size is 5 MB." });
      return;
    }

    try {
      await uploadAvatarMutation.mutateAsync(file);
      setAvatarMessage({ type: "success", text: "Profile picture updated." });
    } catch (err) {
      setAvatarMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload profile picture.",
      });
    }

    // Reset file input so the same file can be re-selected
    e.target.value = "";
  }

  async function handleEmailSave() {
    if (!email.trim()) return;
    setEmailMessage(null);

    try {
      const result = await updateEmailMutation.mutateAsync({ email: email.trim() });
      setEmailMessage({ type: "success", text: result.message });
    } catch (err) {
      setEmailMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update email.",
      });
    }
  }

  async function handlePasswordSave() {
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Current password is required." });
      return;
    }
    if (!newPassword) {
      setPasswordMessage({ type: "error", text: "New password is required." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update password.",
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Picture */}
      <section className="space-y-3">
        <h4 className="text-sm font-medium text-green-400">Profile Picture</h4>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={uploadAvatarMutation.isPending}
            className="relative h-16 w-16 rounded-full border-2 border-green-500 bg-green-950 flex items-center justify-center text-green-400 font-semibold cursor-pointer hover:border-green-400 transition-colors overflow-hidden disabled:opacity-50"
          >
            {uploadAvatarMutation.isPending ? (
              <div className="h-full w-full bg-green-900/40 animate-pulse rounded-full" />
            ) : profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xl">{userInitial || "?"}</span>
            )}
          </button>
          <div>
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploadAvatarMutation.isPending}
              className="text-sm text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
            >
              {uploadAvatarMutation.isPending ? "Uploading..." : "Change picture"}
            </button>
            <p className="text-xs text-green-700 mt-0.5">JPEG, PNG, or WebP. Max 5 MB.</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        {avatarMessage && (
          <p className={`text-sm ${avatarMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {avatarMessage.text}
          </p>
        )}
      </section>

      {/* Change Username */}
      <section className="space-y-3">
        <label className="text-sm font-medium text-green-400 block">Change Username</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="your-username"
            maxLength={39}
            className="flex-1 rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors text-sm"
          />
          <button
            onClick={handleUsernameSave}
            disabled={
              !username.trim() ||
              username.trim().toLowerCase() === profile.username?.toLowerCase() ||
              updateUsernameMutation.isPending
            }
            className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {updateUsernameMutation.isPending ? "Saving..." : "Change Username"}
          </button>
        </div>
        <p className="text-xs text-green-700">
          3–39 characters. Lowercase letters, numbers, and hyphens only.
        </p>
        {usernameMessage && (
          <p className={`text-sm ${usernameMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {usernameMessage.text}
          </p>
        )}
      </section>

      {/* Display Name */}
      <section className="space-y-3">
        <label className="text-sm font-medium text-green-400 block">Display Name</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            maxLength={100}
            className="flex-1 rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors text-sm"
          />
          <button
            onClick={handleNameSave}
            disabled={!displayName.trim() || displayName.trim() === profile.full_name || updateProfileMutation.isPending}
            className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
        {nameMessage && (
          <p className={`text-sm ${nameMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {nameMessage.text}
          </p>
        )}
      </section>

      {/* Email */}
      <section className="space-y-3">
        <label className="text-sm font-medium text-green-400 block">Email</label>
        {isOAuth ? (
          <>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-600 text-sm cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-green-700">
              Email cannot be changed for accounts signed in with Google. Manage your email through your Google account.
            </p>
          </>
        ) : (
          <>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors text-sm"
              />
              <button
                onClick={handleEmailSave}
                disabled={!email.trim() || email.trim().toLowerCase() === profile.email?.toLowerCase() || updateEmailMutation.isPending}
                className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {updateEmailMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
            {emailMessage && (
              <p className={`text-sm ${emailMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
                {emailMessage.text}
              </p>
            )}
          </>
        )}
      </section>

      {/* Password — only for email+password users */}
      {!isOAuth && (
        <section className="space-y-3">
          <label className="text-sm font-medium text-green-400 block">Change Password</label>
          <div className="space-y-2">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors text-sm"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min. 6 characters)"
              className="w-full rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors text-sm"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handlePasswordSave}
              disabled={!currentPassword || !newPassword || !confirmPassword || updatePasswordMutation.isPending}
              className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </button>
          </div>
          {passwordMessage && (
            <p className={`text-sm ${passwordMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {passwordMessage.text}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

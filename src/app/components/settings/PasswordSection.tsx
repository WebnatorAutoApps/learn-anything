"use client";

import { useState } from "react";
import { useUpdatePassword } from "@/lib/hooks";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants/validation";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import type { FeedbackMessage } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export default function PasswordSection() {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<FeedbackMessage>(null);
  const updatePasswordMutation = useUpdatePassword();

  async function handlePasswordSave() {
    setMessage(null);

    if (!currentPassword) {
      setMessage({ type: "error", text: ERROR_MESSAGES.PASSWORD_CURRENT_REQUIRED });
      return;
    }
    if (!newPassword) {
      setMessage({ type: "error", text: ERROR_MESSAGES.PASSWORD_NEW_REQUIRED });
      return;
    }
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setMessage({ type: "error", text: ERROR_MESSAGES.PASSWORD_TOO_SHORT });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: ERROR_MESSAGES.PASSWORD_MISMATCH });
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
      setMessage({ type: "success", text: s.passwordUpdated || "Password updated successfully." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : ERROR_MESSAGES.PASSWORD_UPDATE_FAILED,
      });
    }
  }

  return (
    <section className="space-y-3">
      <label className="text-sm font-medium text-theme-primary block">{s.changePassword || "Change Password"}</label>
      <div className="space-y-2">
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder={s.currentPasswordPlaceholder || "Current password"}
          className="w-full rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-primary placeholder-theme-primary-faint focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary transition-colors text-sm"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={s.newPasswordPlaceholder || "New password (min. 6 characters)"}
          className="w-full rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-primary placeholder-theme-primary-faint focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary transition-colors text-sm"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={s.confirmPasswordPlaceholder || "Confirm new password"}
          className="w-full rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-primary placeholder-theme-primary-faint focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary transition-colors text-sm"
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={handlePasswordSave}
          disabled={!currentPassword || !newPassword || !confirmPassword || updatePasswordMutation.isPending}
          className="px-4 py-2 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold hover:bg-theme-primary-hover transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {updatePasswordMutation.isPending ? (s.updating || "Updating...") : (s.updatePassword || "Update Password")}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-theme-primary" : "text-red-400"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}

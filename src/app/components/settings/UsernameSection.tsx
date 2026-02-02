"use client";

import { useState } from "react";
import { useUpdateUsername, type Profile } from "@/lib/hooks";
import { usernameSchema } from "@/lib/validation";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import type { FeedbackMessage } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

interface UsernameSectionProps {
  profile: Profile;
}

export default function UsernameSection({ profile }: UsernameSectionProps) {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const [username, setUsername] = useState(profile.username || "");
  const [message, setMessage] = useState<FeedbackMessage>(null);
  const updateUsernameMutation = useUpdateUsername();

  async function handleUsernameSave() {
    const trimmed = username.trim().toLowerCase();

    if (!trimmed) {
      setMessage({ type: "error", text: ERROR_MESSAGES.USERNAME_EMPTY });
      return;
    }

    if (trimmed === profile.username?.toLowerCase()) {
      setMessage(null);
      return;
    }

    const result = usernameSchema.safeParse(trimmed);
    if (!result.success) {
      setMessage({ type: "error", text: result.error.issues[0].message });
      return;
    }

    setMessage(null);

    try {
      await updateUsernameMutation.mutateAsync({ username: trimmed });
      setUsername(trimmed);
      setMessage({ type: "success", text: s.usernameUpdated || "Username updated." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : ERROR_MESSAGES.USERNAME_UPDATE_FAILED,
      });
    }
  }

  return (
    <section className="space-y-3">
      <label className="text-sm font-medium text-theme-primary block">{s.changeUsername || "Change Username"}</label>
      <div className="flex gap-3">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="your-username"
          maxLength={39}
          className="flex-1 rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-primary placeholder-theme-primary-faint focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary transition-colors text-sm"
        />
        <button
          onClick={handleUsernameSave}
          disabled={
            !username.trim() ||
            username.trim().toLowerCase() === profile.username?.toLowerCase() ||
            updateUsernameMutation.isPending
          }
          className="px-4 py-2 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold hover:bg-theme-primary-hover transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {updateUsernameMutation.isPending ? (s.saving || "Saving...") : (s.changeUsername || "Change Username")}
        </button>
      </div>
      <p className="text-xs text-theme-muted">
        {s.usernameHelp || "3–39 characters. Lowercase letters, numbers, and hyphens only."}
      </p>
      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-theme-primary" : "text-red-400"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { useUpdateProfile, type Profile } from "@/lib/hooks";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import type { FeedbackMessage } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

interface DisplayNameSectionProps {
  profile: Profile;
}

export default function DisplayNameSection({ profile }: DisplayNameSectionProps) {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const c = t.common as Record<string, string>;
  const [displayName, setDisplayName] = useState(profile.full_name || "");
  const [message, setMessage] = useState<FeedbackMessage>(null);
  const updateProfileMutation = useUpdateProfile();

  async function handleNameSave() {
    if (!displayName.trim()) return;
    setMessage(null);

    try {
      await updateProfileMutation.mutateAsync({ full_name: displayName.trim() });
      setMessage({ type: "success", text: s.displayNameUpdated || "Display name updated." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : ERROR_MESSAGES.DISPLAY_NAME_UPDATE_FAILED,
      });
    }
  }

  return (
    <section className="space-y-3">
      <label className="text-sm font-medium text-theme-primary block">{s.displayName || "Display Name"}</label>
      <div className="flex gap-3">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={s.displayNamePlaceholder || "Your display name"}
          maxLength={100}
          className="flex-1 rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-primary placeholder-theme-primary-faint focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary transition-colors text-sm"
        />
        <button
          onClick={handleNameSave}
          disabled={!displayName.trim() || displayName.trim() === profile.full_name || updateProfileMutation.isPending}
          className="px-4 py-2 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold hover:bg-theme-primary-hover transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {updateProfileMutation.isPending ? (c.saving || "Saving...") : (c.save || "Save")}
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

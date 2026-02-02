"use client";

import { useState } from "react";
import { useUpdateEmail, type Profile } from "@/lib/hooks";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import type { FeedbackMessage } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

interface EmailSectionProps {
  profile: Profile;
}

export default function EmailSection({ profile }: EmailSectionProps) {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const c = t.common as Record<string, string>;
  const isOAuth = profile.auth_provider !== "email";
  const [email, setEmail] = useState(profile.email || "");
  const [message, setMessage] = useState<FeedbackMessage>(null);
  const updateEmailMutation = useUpdateEmail();

  async function handleEmailSave() {
    if (!email.trim()) return;
    setMessage(null);

    try {
      const result = await updateEmailMutation.mutateAsync({ email: email.trim() });
      setMessage({ type: "success", text: result.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : ERROR_MESSAGES.EMAIL_UPDATE_FAILED,
      });
    }
  }

  return (
    <section className="space-y-3">
      <label className="text-sm font-medium text-theme-primary block">{s.emailLabel || "Email"}</label>
      {isOAuth ? (
        <>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-muted text-sm cursor-not-allowed opacity-60"
          />
          <p className="text-xs text-theme-muted">
            {s.emailOAuthInfo || "Email cannot be changed for accounts signed in with Google. Manage your email through your Google account."}
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
              className="flex-1 rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-primary placeholder-theme-primary-faint focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary transition-colors text-sm"
            />
            <button
              onClick={handleEmailSave}
              disabled={!email.trim() || email.trim().toLowerCase() === profile.email?.toLowerCase() || updateEmailMutation.isPending}
              className="px-4 py-2 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold hover:bg-theme-primary-hover transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {updateEmailMutation.isPending ? (c.saving || "Saving...") : (c.save || "Save")}
            </button>
          </div>
          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-theme-primary" : "text-red-400"}`}>
              {message.text}
            </p>
          )}
        </>
      )}
    </section>
  );
}

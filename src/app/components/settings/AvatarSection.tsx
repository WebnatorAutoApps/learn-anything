"use client";

import { useState, useRef } from "react";
import { useUploadAvatar, type Profile } from "@/lib/hooks";
import { MAX_AVATAR_FILE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants/validation";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import type { FeedbackMessage } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

interface AvatarSectionProps {
  profile: Profile;
}

export default function AvatarSection({ profile }: AvatarSectionProps) {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<FeedbackMessage>(null);
  const uploadAvatarMutation = useUploadAvatar();

  const userInitial = (profile.full_name || profile.email || "").charAt(0).toUpperCase();

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setMessage({ type: "error", text: ERROR_MESSAGES.AVATAR_INVALID_TYPE });
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setMessage({ type: "error", text: ERROR_MESSAGES.AVATAR_TOO_LARGE });
      return;
    }

    try {
      await uploadAvatarMutation.mutateAsync(file);
      setMessage({ type: "success", text: s.profilePictureUpdated || "Profile picture updated." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : ERROR_MESSAGES.AVATAR_UPLOAD_FAILED,
      });
    }

    e.target.value = "";
  }

  return (
    <section className="space-y-3">
      <h4 className="text-sm font-medium text-theme-primary">{s.profilePicture || "Profile Picture"}</h4>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={uploadAvatarMutation.isPending}
          className="relative h-16 w-16 rounded-full border-2 border-theme-primary bg-theme-surface flex items-center justify-center text-theme-primary font-semibold cursor-pointer hover:border-theme-primary transition-colors overflow-hidden disabled:opacity-50"
        >
          {uploadAvatarMutation.isPending ? (
            <div className="h-full w-full bg-theme-surface-hover animate-pulse rounded-full" />
          ) : profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={s.profilePicture || "Profile"}
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
            className="text-sm text-theme-primary hover:text-theme-primary transition-colors disabled:opacity-50"
          >
            {uploadAvatarMutation.isPending ? (s.uploading || "Uploading...") : (s.changePicture || "Change picture")}
          </button>
          <p className="text-xs text-theme-muted mt-0.5">{s.avatarHelp || "JPEG, PNG, or WebP. Max 5 MB."}</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>
      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-theme-primary" : "text-red-400"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}

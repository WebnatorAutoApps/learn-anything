"use client";

import type { Profile } from "@/lib/hooks";
import AvatarSection from "./AvatarSection";
import UsernameSection from "./UsernameSection";
import DisplayNameSection from "./DisplayNameSection";
import EmailSection from "./EmailSection";
import PasswordSection from "./PasswordSection";

interface GeneralSettingsProps {
  profile: Profile;
}

export default function GeneralSettings({ profile }: GeneralSettingsProps) {
  const isOAuth = profile.auth_provider !== "email";

  return (
    <div className="space-y-8">
      <AvatarSection profile={profile} />
      <UsernameSection profile={profile} />
      <DisplayNameSection profile={profile} />
      <EmailSection profile={profile} />
      {!isOAuth && <PasswordSection />}
    </div>
  );
}

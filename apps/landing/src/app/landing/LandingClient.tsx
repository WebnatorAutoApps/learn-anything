"use client";

import { I18nProvider } from "@/i18n/I18nProvider";
import LandingContent from "./LandingContent";

export default function LandingClient() {
  return (
    <I18nProvider>
      <LandingContent />
    </I18nProvider>
  );
}

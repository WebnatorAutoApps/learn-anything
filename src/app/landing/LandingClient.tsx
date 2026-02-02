"use client";

import { I18nProvider } from "@/lib/i18n";
import LandingContent from "./LandingContent";

export default function LandingClient() {
  return (
    <I18nProvider>
      <LandingContent />
    </I18nProvider>
  );
}

import React, { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { Platform } from "react-native";
import { useI18n } from "../../i18n/I18nProvider";

interface Tip {
  id: string;
  messageKey: string;
  ctaLabelKey: string;
  ctaAction:
    | { type: "settings"; tab: "general" | "api-keys" | "customization" }
    | { type: "route"; path: string };
}

const tips: Tip[] = [
  {
    id: "theme",
    messageKey: "themeMessage",
    ctaLabelKey: "themeCta",
    ctaAction: { type: "settings", tab: "customization" },
  },
  {
    id: "personality",
    messageKey: "personalityMessage",
    ctaLabelKey: "personalityCta",
    ctaAction: { type: "settings", tab: "customization" },
  },
  {
    id: "browse",
    messageKey: "browseMessage",
    ctaLabelKey: "browseCta",
    ctaAction: { type: "route", path: "/(app)/courses" },
  },
  {
    id: "profile",
    messageKey: "profileMessage",
    ctaLabelKey: "profileCta",
    ctaAction: { type: "settings", tab: "general" },
  },
  {
    id: "api-key",
    messageKey: "apiKeyMessage",
    ctaLabelKey: "apiKeyCta",
    ctaAction: { type: "settings", tab: "api-keys" },
  },
];

const DISMISSED_KEY = "learn-anything-tip-dismissed";
const LAST_TIP_KEY = "learn-anything-last-tip-id";

function getStorageItem(key: string): string | null {
  if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
}

function setStorageItem(key: string, value: string): void {
  if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // ignore
    }
  }
}

function pickRandomTip(): Tip | null {
  if (getStorageItem(DISMISSED_KEY) === "true") return null;

  const lastTipId = getStorageItem(LAST_TIP_KEY);
  const candidates = tips.filter((t) => t.id !== lastTipId);
  const source = candidates.length > 0 ? candidates : tips;
  const selected = source[Math.floor(Math.random() * source.length)];

  setStorageItem(LAST_TIP_KEY, selected.id);
  return selected;
}

interface TipBannerProps {
  onOpenSettings?: (tab: "general" | "api-keys" | "customization") => void;
  onNavigate?: (path: string) => void;
}

export default function TipBanner({ onOpenSettings, onNavigate }: TipBannerProps) {
  const { t } = useI18n();
  const tipsT = t.tips as Record<string, string>;
  const [tip] = useState<Tip | null>(() => pickRandomTip());
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setStorageItem(DISMISSED_KEY, "true");
  }, []);

  const handleCtaClick = useCallback(() => {
    if (!tip) return;
    if (tip.ctaAction.type === "settings") {
      onOpenSettings?.(tip.ctaAction.tab);
    } else {
      onNavigate?.(tip.ctaAction.path);
    }
  }, [tip, onOpenSettings, onNavigate]);

  if (dismissed || !tip) return null;

  return (
    <View className="border border-theme-primary/20 bg-theme-surface px-3 py-2 mb-4">
      <View className="flex-row items-start justify-between gap-2 mb-2">
        <View className="flex-row items-start gap-2 flex-1 min-w-0">
          <Text className="font-mono text-sm text-theme-primary">{">"}</Text>
          <Text className="font-mono text-sm text-theme-primary flex-1">
            {tipsT[tip.messageKey]}
          </Text>
        </View>
        <Pressable onPress={handleDismiss} className="px-1 py-0.5">
          <Text className="font-mono text-sm text-theme-muted">X</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={handleCtaClick}
        className="border border-theme-primary/30 px-2 py-1 self-start"
      >
        <Text className="font-mono text-sm text-theme-primary font-bold">
          [{tipsT[tip.ctaLabelKey]}]
        </Text>
      </Pressable>
    </View>
  );
}

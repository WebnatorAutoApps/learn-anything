"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { tips, pickRandomTip, type Tip } from "@/lib/tips";
import { useI18n } from "@/lib/i18n";

const DISMISSED_KEY = "learn-anything-tip-dismissed";

function getInitialTip(): Tip | null {
  if (typeof window === "undefined") return null;
  try {
    if (sessionStorage.getItem(DISMISSED_KEY) === "true") return null;
  } catch {
    // sessionStorage unavailable
  }
  return pickRandomTip(tips);
}

interface TipBannerProps {
  onOpenSettings?: (tab: "general" | "api-keys" | "customization") => void;
  onNavigate?: (path: string) => void;
}

export default function TipBanner({ onOpenSettings, onNavigate }: TipBannerProps) {
  const { t } = useI18n();
  const tipsT = t.tips as Record<string, string>;
  const [tip] = useState<Tip | null>(getInitialTip);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const animationFrameRef = useRef(0);

  useEffect(() => {
    if (!tip) return;
    // Trigger enter animation on next frame
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = requestAnimationFrame(() => {
        setVisible(true);
      });
    });
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [tip]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    // Wait for the exit transition to finish before removing from DOM
    const timeout = setTimeout(() => {
      setDismissed(true);
      try {
        sessionStorage.setItem(DISMISSED_KEY, "true");
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(timeout);
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
    <div
      role="status"
      aria-live="polite"
      className={`relative z-20 border-b border-theme-border overflow-hidden transition-all duration-300 ease-in-out ${
        visible ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Lightbulb icon */}
            <svg
              className="h-4 w-4 flex-shrink-0 text-theme-primary"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm text-theme-primary truncate">
              {tipsT[tip.messageKey]}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCtaClick}
              className="rounded-md border border-theme-border-strong px-3 py-1 text-xs font-medium text-theme-primary hover:bg-theme-surface-hover transition-colors whitespace-nowrap"
            >
              {tipsT[tip.ctaLabelKey]}
            </button>
            <button
              onClick={handleDismiss}
              className="flex h-6 w-6 items-center justify-center rounded-md text-theme-muted hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
              aria-label={tipsT.dismissTip}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

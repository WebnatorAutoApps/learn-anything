"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";

interface ApiKeySetupGuideProps {
  onClose: () => void;
  onGoToSettings: () => void;
}

const STEP_KEYS = [
  { titleKey: "step1Title", bodyKey: "step1Body" },
  { titleKey: "step2Title", bodyKey: "step2Body" },
  { titleKey: "step3Title", bodyKey: "step3Body" },
  { titleKey: "step4Title", bodyKey: "step4Body" },
] as const;

export default function ApiKeySetupGuide({
  onClose,
  onGoToSettings,
}: ApiKeySetupGuideProps) {
  const { t } = useI18n();
  const c = t.common as Record<string, string>;
  const g = t.apiKeyGuide as Record<string, string>;
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-guide-title"
    >
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg mx-4 rounded-lg border border-theme-border bg-theme-surface shadow-lg shadow-[color:var(--t-glow)] max-h-[85vh] flex flex-col outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme-border px-6 py-4 shrink-0">
          <h3
            id="setup-guide-title"
            className="text-lg font-semibold text-theme-primary tracking-wide"
          >
            <span className="text-theme-secondary">{">"}</span> {g.title}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-theme-muted hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
            aria-label={c.close}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          {/* Intro */}
          <p className="text-sm leading-relaxed text-theme-muted">
            {g.intro}
          </p>

          {/* What is a Gemini API key */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-theme-primary">
              {g.whatIsTitle}
            </h4>
            <p className="text-xs leading-relaxed text-theme-muted">
              {g.whatIsBody}
            </p>
          </div>

          {/* Step-by-step guide */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-theme-primary">
              {g.stepsTitle}
            </h4>
            <ol className="space-y-3 list-none">
              {STEP_KEYS.map((step, index) => (
                <li key={step.titleKey} className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full border border-theme-border text-xs font-semibold text-theme-secondary mt-0.5">
                    {index + 1}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-theme-primary">
                      {g[step.titleKey]}
                    </p>
                    <p className="text-xs leading-relaxed text-theme-muted">
                      {step.titleKey === "step2Title" ? (
                        <>
                          {g[step.bodyKey]}{" "}
                          <a
                            href="https://aistudio.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-theme-secondary underline hover:text-theme-primary transition-colors"
                          >
                            aistudio.google.com
                          </a>
                        </>
                      ) : (
                        g[step.bodyKey]
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Tip */}
          <div className="rounded-md border border-theme-border bg-theme-surface-hover px-4 py-3">
            <p className="text-xs leading-relaxed text-theme-muted">
              <span className="font-semibold text-theme-primary">{g.tipLabel}</span>{" "}
              {g.tipBody}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end border-t border-theme-border px-6 py-4 shrink-0">
          <button
            onClick={onClose}
            className="rounded-lg border border-theme-border px-4 py-2 text-sm text-theme-primary hover:bg-theme-surface-hover transition-colors"
          >
            {c.close}
          </button>
          <button
            onClick={onGoToSettings}
            className="rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold px-4 py-2 text-sm hover:bg-theme-primary-hover transition-colors"
          >
            {g.goToSettings}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  LOADING_MESSAGE_KEYS,
  EXTENDED_WAIT_KEY,
  MESSAGE_ROTATION_INTERVAL_MS,
  EXTENDED_WAIT_THRESHOLD_MS,
} from "@/lib/constants/loading-messages";
import { useI18n } from "@/lib/i18n";

interface ProgramCreationLoaderProps {
  error?: string | null;
  onDismissError: () => void;
}

export default function ProgramCreationLoader({
  error,
  onDismissError,
}: ProgramCreationLoaderProps) {
  const { t } = useI18n();
  const loading = t.loading as Record<string, string>;
  const errors = t.errors as Record<string, string>;

  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * LOADING_MESSAGE_KEYS.length)
  );
  const [showExtendedWait, setShowExtendedWait] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  // Rotate messages on interval
  useEffect(() => {
    if (error) return;

    const interval = setInterval(() => {
      setFadingOut(true);
      setTimeout(() => {
        setMessageIndex((prev) => {
          let next = prev;
          // Avoid repeating the same message consecutively
          while (next === prev) {
            next = Math.floor(Math.random() * LOADING_MESSAGE_KEYS.length);
          }
          return next;
        });
        setFadingOut(false);
      }, 300);
    }, MESSAGE_ROTATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [error]);

  // Show extended wait message after threshold
  useEffect(() => {
    if (error) return;

    const timeout = setTimeout(() => {
      setShowExtendedWait(true);
    }, EXTENDED_WAIT_THRESHOLD_MS);

    return () => clearTimeout(timeout);
  }, [error]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 w-full max-w-md mx-4 rounded-lg border border-red-900/60 bg-theme-surface shadow-lg shadow-[color:var(--t-glow)] p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg
              className="h-12 w-12 text-red-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            {errors.somethingWentWrong}
          </h3>
          <p className="text-theme-primary text-sm mb-6">{error}</p>
          <button
            type="button"
            onClick={onDismissError}
            className="px-6 py-2 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold hover:bg-theme-primary-hover transition-colors"
          >
            {errors.goBack}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85" />
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-lg text-center">
        {/* Spinner */}
        <div className="loader-spinner" />

        {/* Rotating message */}
        <p
          className={`text-theme-primary text-lg sm:text-xl font-medium transition-opacity duration-300 min-h-[3.5rem] flex items-center ${
            fadingOut ? "opacity-0" : "opacity-100"
          }`}
        >
          {loading[LOADING_MESSAGE_KEYS[messageIndex]]}
        </p>

        {/* Extended wait notice */}
        {showExtendedWait && (
          <p className="text-theme-muted text-sm animate-pulse">
            {loading[EXTENDED_WAIT_KEY]}
          </p>
        )}
      </div>
    </div>
  );
}

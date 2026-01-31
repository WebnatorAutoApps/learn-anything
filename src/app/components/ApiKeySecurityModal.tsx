"use client";

import { useEffect, useRef } from "react";
import { API_KEY_SECURITY_SECTIONS } from "@/lib/constants/api-key-security";

interface ApiKeySecurityModalProps {
  onClose: () => void;
}

export default function ApiKeySecurityModal({
  onClose,
}: ApiKeySecurityModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus trap: focus the modal when it opens
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-modal-title"
    >
      {/* Backdrop — click to dismiss */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg mx-4 rounded-lg border border-theme-border bg-theme-surface shadow-lg shadow-[color:var(--t-glow)] max-h-[85vh] flex flex-col outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme-border px-6 py-4 shrink-0">
          <h3
            id="security-modal-title"
            className="text-lg font-semibold text-theme-primary tracking-wide"
          >
            <span className="text-theme-secondary">{">"}</span> API Key Security
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-theme-muted hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
            aria-label="Close"
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
          {API_KEY_SECURITY_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <h4 className="text-sm font-semibold text-theme-primary">
                {section.title}
              </h4>
              <p className="text-xs leading-relaxed text-theme-muted">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

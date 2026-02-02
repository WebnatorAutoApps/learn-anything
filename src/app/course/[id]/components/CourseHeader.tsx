"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

interface CourseHeaderProps {
  title: string;
  isEnrolled: boolean;
  onShowPathDetail: () => void;
  onShowUnenrollDialog: () => void;
}

export default function CourseHeader({
  title,
  isEnrolled,
  onShowPathDetail,
  onShowUnenrollDialog,
}: CourseHeaderProps) {
  const router = useRouter();
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;
  const c = t.common as Record<string, string>;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  return (
    <header className="relative z-20 border-b border-theme-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          <button
            onClick={() => router.push("/app")}
            className="text-theme-secondary hover:text-theme-primary transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">{c.back || "Back"}</span>
          </button>
          <div className="h-6 w-px bg-theme-border" />
          <h1 className="text-xl font-semibold text-theme-primary tracking-wider truncate flex-1">
            {title}
          </h1>

          {isEnrolled && (
            <>
              <button
                onClick={onShowPathDetail}
                className="text-sm text-theme-secondary hover:text-theme-primary transition-colors border border-theme-border rounded px-3 py-1.5 hover:bg-theme-surface-hover flex-shrink-0"
              >
                {cr.seeMore || "See more"}
              </button>

              {/* Three-dot overflow menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover rounded-lg transition-colors"
                  aria-label={cr.courseOptions || "Course options"}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 rounded-lg border border-theme-border bg-theme-surface shadow-lg z-30">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onShowUnenrollDialog();
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-theme-surface-hover transition-colors rounded-lg"
                    >
                      {cr.unenroll || "Unenroll"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

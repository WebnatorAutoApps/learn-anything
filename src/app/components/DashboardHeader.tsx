"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

interface DashboardHeaderProps {
  profileLoading: boolean;
  avatarUrl: string | null;
  userInitial: string;
  username?: string | null;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}

export default function DashboardHeader({
  profileLoading,
  avatarUrl,
  userInitial,
  username,
  isMenuOpen,
  setIsMenuOpen,
  onSettingsClick,
  onLogoutClick,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { t } = useI18n();
  const h = t.header as Record<string, string>;
  const d = t.dashboard as Record<string, string>;
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useClickOutside([menuRef, avatarRef], () => setIsMenuOpen(false));

  return (
    <header className="relative z-20 border-b border-theme-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <h1 className="text-xl font-semibold text-theme-primary tracking-wider">
            {h.title || "Learn Anything"}
          </h1>
          <div className="relative flex items-center">
            <div
              ref={avatarRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onMouseEnter={() => setIsMenuOpen(true)}
              className="h-10 w-10 rounded-full border-2 border-theme-primary bg-theme-surface flex items-center justify-center text-theme-primary font-semibold cursor-pointer hover:border-theme-primary hover:bg-theme-surface-hover transition-colors overflow-hidden"
            >
              {profileLoading ? (
                <div className="h-full w-full bg-theme-surface-hover animate-pulse rounded-full" />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={h.profile || "Profile"}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                userInitial || "?"
              )}
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                ref={menuRef}
                onMouseLeave={() => setIsMenuOpen(false)}
                className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-theme-border bg-theme-surface shadow-lg shadow-[color:var(--t-glow)] overflow-hidden"
              >
                {username && (
                  <div className="px-4 py-3 text-theme-primary text-sm font-semibold border-b border-theme-border truncate">
                    @{username}
                  </div>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/courses");
                  }}
                  className="w-full px-4 py-3 text-left text-theme-primary hover:bg-theme-surface-hover transition-colors flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {d.browsePaths || "Browse Learning Paths"}
                </button>
                <button
                  onClick={onSettingsClick}
                  className="w-full px-4 py-3 text-left text-theme-primary hover:bg-theme-surface-hover transition-colors flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  {h.settings || "Settings"}
                </button>
                <button
                  onClick={onLogoutClick}
                  className="w-full px-4 py-3 text-left text-theme-primary hover:bg-theme-surface-hover transition-colors flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {h.logout || "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

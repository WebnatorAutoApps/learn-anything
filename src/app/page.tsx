"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import LearnModal from "./components/LearnModal";
import type { LearningPlanData } from "./components/LearnModal";
import SettingsModal from "./components/SettingsModal";
import ProgramCreationLoader from "./components/ProgramCreationLoader";
import ActiveModuleCarousel from "./components/ActiveModuleCarousel";
import { CourseGridSkeleton } from "./components/PageLoader";
import { useProfile, useCourses } from "@/lib/hooks/queries";

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLearnModal, setShowLearnModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // TanStack Query hooks
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useProfile();

  const { data: courses = [], isLoading: coursesLoading } = useCourses("started");

  const userInitial = profile
    ? (profile.full_name || profile.email || "").charAt(0).toUpperCase()
    : "";
  const avatarUrl = profile?.avatar_url || null;

  // Abort in-flight creation request on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleProgramSubmit = useCallback(
    async (planData: LearningPlanData) => {
      if (isCreating) return; // Prevent double submission

      // Close modal, show loader
      setShowLearnModal(false);
      setIsCreating(true);
      setCreationError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(planData),
          signal: controller.signal,
        });

        const data = await res.json();

        // Handle low likelihood response
        if (data.low_likelihood) {
          setCreationError(
            `Low likelihood of success (${data.likelihood_of_learning}%). ${data.error}`
          );
          return;
        }

        if (!res.ok || !data.success) {
          setCreationError(
            data.error || "Something went wrong. Please try again."
          );
          return;
        }

        // Navigate to the new course page
        const courseId = data.course?.id;
        if (courseId) {
          router.push(`/course/${courseId}`);
        } else {
          // Fallback: course created but no ID returned
          setIsCreating(false);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Request was aborted (user navigated away), do nothing
          return;
        }
        setCreationError(
          "Network error. Please check your connection and try again."
        );
      }
    },
    [isCreating, router]
  );

  function handleDismissCreationError() {
    setIsCreating(false);
    setCreationError(null);
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        avatarRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAvatarClick() {
    setIsMenuOpen(!isMenuOpen);
  }

  function handleAvatarMouseEnter() {
    setIsMenuOpen(true);
  }

  function handleMenuMouseLeave() {
    setIsMenuOpen(false);
  }

  function handleLearnClick() {
    if (!profile?.has_gemini_api_key) {
      setShowApiKeyWarning(true);
      return;
    }
    setShowLearnModal(true);
  }

  function handleApiKeyWarningGoToSettings() {
    setShowApiKeyWarning(false);
    setShowSettingsModal(true);
  }

  function handleSettingsClick() {
    setIsMenuOpen(false);
    setShowSettingsModal(true);
  }

  function handleLogoutClick() {
    setIsMenuOpen(false);
    setShowLogoutDialog(true);
  }

  async function handleConfirmLogout() {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch {
      // If logout fails, just redirect anyway
      router.push("/login");
    }
  }

  function handleCancelLogout() {
    setShowLogoutDialog(false);
  }

  return (
    <div className="terminal-screen min-h-screen font-mono">
      {/* CRT vignette overlay */}
      <div className="terminal-vignette" />

      {/* Top Bar */}
      <header className="relative z-20 border-b border-green-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-green-400 tracking-wider">
              Learn Anything
            </h1>
            <div className="relative flex items-center">
              <div
                ref={avatarRef}
                onClick={handleAvatarClick}
                onMouseEnter={handleAvatarMouseEnter}
                className="h-10 w-10 rounded-full border-2 border-green-500 bg-green-950 flex items-center justify-center text-green-400 font-semibold cursor-pointer hover:border-green-400 hover:bg-green-950/50 transition-colors overflow-hidden"
              >
                {profileLoading ? (
                  <div className="h-full w-full bg-green-900/40 animate-pulse rounded-full" />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
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
                  onMouseLeave={handleMenuMouseLeave}
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-green-900/60 bg-green-950/95 shadow-lg shadow-green-900/20 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push("/courses");
                    }}
                    className="w-full px-4 py-3 text-left text-green-400 hover:bg-green-900/50 transition-colors flex items-center gap-2"
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
                    My Learning Paths
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="w-full px-4 py-3 text-left text-green-400 hover:bg-green-900/50 transition-colors flex items-center gap-2"
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
                    Settings
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-4 py-3 text-left text-green-400 hover:bg-green-900/50 transition-colors flex items-center gap-2"
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
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {profileError && (
        <div className="relative z-20 border-b border-red-900/50 bg-red-950/30 px-4 sm:px-6 lg:px-8 py-4">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-red-400">
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">
                We&apos;re having trouble right now. Some features may not work properly.
              </span>
            </div>
            <button
              onClick={() => refetchProfile()}
              disabled={profileLoading}
              className="flex-shrink-0 rounded-md border border-red-900/60 px-3 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
            >
              {profileLoading ? "Retrying..." : "Retry"}
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-green-400 mb-2 tracking-wide">
              <span className="text-green-600">{">"}</span> What do you want to
              learn today?
              <span className="inline-block w-2.5 h-5 bg-green-400 ml-1 animate-pulse align-middle" />
            </h2>
            <p className="text-green-600">
              Your active learning paths. Continue where you left off.
            </p>
          </div>
          <button
            onClick={() => router.push("/courses")}
            className="flex-shrink-0 px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors text-sm flex items-center gap-2"
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
            My Learning Paths
          </button>
        </div>

        <ActiveModuleCarousel />

        {coursesLoading ? (
          <CourseGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => router.push(`/course/${course.id}`)}
                className="group relative overflow-hidden rounded-lg border border-green-900/60 bg-green-950/20 p-6 text-left transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] hover:border-green-500/70 hover:bg-green-950/40"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-green-800/50 bg-green-950/50">
                    <span className="text-lg font-bold text-green-400">
                      {course.normalized_title.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-green-400 truncate">
                      {course.normalized_title}
                    </h3>
                    <p className="text-sm text-green-700">
                      {course.total_modules} steps
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {/* Add New Button */}
            <button
              onClick={handleLearnClick}
              className="group relative overflow-hidden rounded-lg border-2 border-dashed border-green-900/50 bg-green-950/10 p-6 text-left transition-all hover:border-green-600/50 hover:bg-green-950/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-green-800/50 bg-green-950/50">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-400">
                    Learn Something New
                  </h3>
                  <p className="text-sm text-green-700">
                    Add a new topic
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {/* API Key Warning Dialog */}
      {showApiKeyWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowApiKeyWarning(false)}
          />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-lg border border-green-900/60 bg-green-950/95 p-6 shadow-lg shadow-green-900/30">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              API Key Required
            </h3>
            <p className="text-green-600 mb-6">
              You don&apos;t have an API key configured. We won&apos;t be able
              to create a learning path for you. Please go to Settings to add
              one.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowApiKeyWarning(false)}
                className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApiKeyWarningGoToSettings}
                className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors"
              >
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learn Something New Modal */}
      {showLearnModal && (
        <LearnModal
          onClose={() => setShowLearnModal(false)}
          onSubmit={handleProgramSubmit}
        />
      )}

      {/* Program Creation Loading Screen */}
      {isCreating && (
        <ProgramCreationLoader
          error={creationError}
          onDismissError={handleDismissCreationError}
        />
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={handleCancelLogout}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md mx-4 rounded-lg border border-green-900/60 bg-green-950/95 p-6 shadow-lg shadow-green-900/30">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Confirm Logout
            </h3>
            <p className="text-green-600 mb-6">
              Are you sure you want to log out?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

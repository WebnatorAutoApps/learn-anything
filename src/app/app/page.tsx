"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LearnModal from "@/app/components/LearnModal";
import type { LearningPlanData } from "@/app/components/LearnModal";
import SettingsModal from "@/app/components/SettingsModal";
import ProgramCreationLoader from "@/app/components/ProgramCreationLoader";
import ActiveModuleCarousel from "@/app/components/ActiveModuleCarousel";
import TipBanner from "@/app/components/TipBanner";
import DashboardHeader from "@/app/components/DashboardHeader";
import CourseGrid from "@/app/components/CourseGrid";
import LogoutConfirmDialog from "@/app/components/LogoutConfirmDialog";
import ApiKeyWarningDialog from "@/app/components/ApiKeyWarningDialog";
import ApiKeyBanner from "@/app/components/ApiKeyBanner";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import {
  useProfile,
  useCourses,
  useCourseCreation,
  useSettingsModal,
  useLogoutFlow,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();
  const d = t.dashboard as Record<string, string>;
  const c = t.common as Record<string, string>;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLearnModal, setShowLearnModal] = useState(false);

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useProfile();

  const { data: courses = [], isLoading: coursesLoading } = useCourses("started");

  const {
    isCreating,
    creationError,
    creationErrorKey,
    lastPlanData,
    handleProgramSubmit,
    retryCreation,
    dismissCreationError,
  } = useCourseCreation();

  const {
    showSettingsModal,
    settingsInitialTab,
    showApiKeyWarning,
    openSettings,
    closeSettings,
    openApiKeyWarning,
    closeApiKeyWarning,
    handleApiKeyWarningGoToSettings,
  } = useSettingsModal();

  const {
    showLogoutDialog,
    isLoggingOut,
    openLogoutDialog,
    cancelLogout,
    confirmLogout,
  } = useLogoutFlow();

  const userInitial = profile
    ? (profile.full_name || profile.email || "").charAt(0).toUpperCase()
    : "";
  const avatarUrl = profile?.avatar_url || null;

  function handleLearnClick() {
    if (!profile?.has_gemini_api_key) {
      openApiKeyWarning();
      return;
    }
    setShowLearnModal(true);
  }

  function handleLearnSubmit(planData: LearningPlanData) {
    setShowLearnModal(false);
    handleProgramSubmit(planData);
  }

  function handleSettingsClick() {
    setIsMenuOpen(false);
    openSettings("general");
  }

  function handleLogoutClick() {
    setIsMenuOpen(false);
    openLogoutDialog();
  }

  return (
    <div className="terminal-screen min-h-screen font-mono">
      {/* CRT vignette overlay */}
      <div className="terminal-vignette" />

      <DashboardHeader
        profileLoading={profileLoading}
        avatarUrl={avatarUrl}
        userInitial={userInitial}
        username={profile?.username}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onSettingsClick={handleSettingsClick}
        onLogoutClick={handleLogoutClick}
      />

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
                {d.errorBanner || "We're having trouble right now. Some features may not work properly."}
              </span>
            </div>
            <button
              onClick={() => refetchProfile()}
              disabled={profileLoading}
              className="flex-shrink-0 rounded-md border border-red-900/60 px-3 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
            >
              {profileLoading ? (c.retrying || "Retrying...") : (c.retry || "Retry")}
            </button>
          </div>
        </div>
      )}

      {/* API Key Setup Banner */}
      <ApiKeyBanner onOpenSettings={openSettings} />

      {/* Tip Banner */}
      <TipBanner
        onOpenSettings={openSettings}
        onNavigate={(path) => router.push(path)}
      />

      {/* Body */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <ErrorBoundary>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-theme-primary mb-2 tracking-wide">
                <span className="text-theme-secondary">{">"}</span> {d.heading || "What do you want to learn today?"}
                <span className="inline-block w-2.5 h-5 bg-theme-primary ml-1 animate-pulse align-middle" />
              </h2>
              <p className="text-theme-muted">
                {d.subheading || "Your active learning paths. Continue where you left off."}
              </p>
            </div>
            <button
              onClick={() => router.push("/courses")}
              className="w-full sm:w-auto sm:flex-shrink-0 px-4 py-3 sm:py-2 rounded-lg border border-theme-border text-theme-primary hover:bg-theme-surface-hover transition-colors text-sm flex items-center justify-center sm:justify-start gap-2"
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
          </div>

          <ActiveModuleCarousel />

          <CourseGrid
            courses={courses}
            isLoading={coursesLoading}
            onLearnClick={handleLearnClick}
          />
        </ErrorBoundary>
      </main>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          onClose={closeSettings}
          initialTab={settingsInitialTab}
        />
      )}

      {/* API Key Warning Dialog */}
      {showApiKeyWarning && (
        <ApiKeyWarningDialog
          onGoToSettings={handleApiKeyWarningGoToSettings}
          onCancel={closeApiKeyWarning}
        />
      )}

      {/* Learn Something New Modal */}
      {showLearnModal && (
        <LearnModal
          onClose={() => setShowLearnModal(false)}
          onSubmit={handleLearnSubmit}
        />
      )}

      {/* Program Creation Loading Screen */}
      {isCreating && (
        <ProgramCreationLoader
          error={creationError}
          errorKey={creationErrorKey}
          canRetry={!!lastPlanData}
          onRetry={retryCreation}
          onDismissError={dismissCreationError}
        />
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <LogoutConfirmDialog
          isLoggingOut={isLoggingOut}
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}
    </div>
  );
}

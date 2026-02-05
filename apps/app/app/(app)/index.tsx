import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useProfile, useCourses, useSettingsModal, useGeminiKey } from "@learn-anything/shared";
import { useI18n } from "../../src/i18n/I18nProvider";
import { useCourseCreation, useLogoutFlow } from "../../src/hooks";
import {
  DashboardHeader,
  CourseGrid,
  TipBanner,
  ApiKeyBanner,
  ProgramCreationLoader,
  LogoutConfirmDialog,
  ApiKeyWarningDialog,
} from "../../src/components/dashboard";
import { Button } from "../../src/components/ui";
import { SettingsModal } from "../../src/components/settings";
import { LearnModal } from "../../src/components/learn-modal";
import type { LearningPlanData } from "../../src/hooks";

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const d = t.dashboard as Record<string, string>;
  const c = t.common as Record<string, string>;

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useProfile();

  const { data: courses = [], isLoading: coursesLoading } = useCourses("started");
  const { hasKey: hasGeminiKey } = useGeminiKey();

  const {
    isCreating,
    handleProgramSubmit,
    retryCreation,
    dismissCreationError,
    creationError,
    creationErrorKey,
    lastPlanData,
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

  const [showLearnModal, setShowLearnModal] = useState(false);

  const userInitial = profile
    ? (profile.full_name || profile.email || "").charAt(0).toUpperCase()
    : "";
  const avatarUrl = profile?.avatar_url || null;

  function handleLearnClick() {
    if (!hasGeminiKey) {
      openApiKeyWarning();
      return;
    }
    setShowLearnModal(true);
  }

  function handleSettingsClick() {
    openSettings("general");
  }

  function handleBrowseClick() {
    router.push("/(app)/courses");
  }

  return (
    <View className="flex-1 bg-theme-bg">
      <DashboardHeader
        profileLoading={profileLoading}
        avatarUrl={avatarUrl}
        userInitial={userInitial}
        username={profile?.username}
        onSettingsClick={handleSettingsClick}
        onLogoutClick={openLogoutDialog}
        onBrowseClick={handleBrowseClick}
      />

      {profileError && (
        <View className="border-b border-red-900/50 bg-red-950/30 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-red-400 flex-1">
              {d.errorBanner || "We're having trouble right now."}
            </Text>
            <Button
              variant="danger"
              size="sm"
              onPress={() => refetchProfile()}
              loading={profileLoading}
            >
              {c.retry || "Retry"}
            </Button>
          </View>
        </View>
      )}

      <ScrollView className="flex-1 px-4 py-6">
        <TipBanner
          onOpenSettings={(tab) => openSettings(tab)}
          onNavigate={(path) => router.push(path as any)}
        />

        <ApiKeyBanner onOpenSettings={(tab) => openSettings(tab)} />

        <View className="mb-2">
          <Text className="font-mono text-sm text-theme-muted mb-3">
            {"> "}system ready. awaiting input...
          </Text>
          <View className="flex-row items-center">
            <Text className="font-mono text-xl text-theme-primary">
              {"$ "}
            </Text>
            <Text className="font-mono text-xl font-bold text-theme-primary">
              {d.heading || "What do you want to learn today?"}
            </Text>
            <Text className="font-mono text-xl text-theme-primary animate-blink">
              _
            </Text>
          </View>
          <Text className="font-mono text-sm text-theme-muted mt-2">
            {"// "}{d.subheading || "Your active learning paths. Continue where you left off."}
          </Text>
        </View>

        <View className="my-4 h-px bg-theme-primary/20" />

        <Pressable
          onPress={handleBrowseClick}
          className="mb-4 px-4 py-2 border border-theme-primary/30 bg-theme-surface flex-row items-center justify-center"
        >
          <Text className="font-mono text-theme-primary text-base">
            {"[ "}{d.browsePaths || "Browse Learning Paths"}{" ]"}
          </Text>
        </Pressable>

        <CourseGrid
          courses={courses}
          isLoading={coursesLoading}
          onLearnClick={handleLearnClick}
        />
      </ScrollView>

      {showApiKeyWarning && (
        <ApiKeyWarningDialog
          onGoToSettings={handleApiKeyWarningGoToSettings}
          onCancel={closeApiKeyWarning}
        />
      )}

      {showLogoutDialog && (
        <LogoutConfirmDialog
          isLoggingOut={isLoggingOut}
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}

      <SettingsModal
        visible={showSettingsModal}
        onClose={closeSettings}
        initialTab={settingsInitialTab}
      />

      <LearnModal
        visible={showLearnModal}
        onClose={() => setShowLearnModal(false)}
        onSubmit={(planData: LearningPlanData) => {
          setShowLearnModal(false);
          handleProgramSubmit(planData);
        }}
      />

      {isCreating && (
        <ProgramCreationLoader
          error={creationError}
          errorKey={creationErrorKey}
          canRetry={!!lastPlanData}
          onRetry={retryCreation}
          onDismissError={() => {
            dismissCreationError();
            setShowLearnModal(true);
          }}
        />
      )}
    </View>
  );
}

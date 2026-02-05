import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import {
  useUnenrollCourse,
  useSelectProject,
  useCompleteProject,
} from "@learn-anything/shared";
import type { CourseDetail, Module } from "@learn-anything/shared";
import CourseHeader from "./CourseHeader";
import ProgressSection from "./ProgressSection";
import CompletionCelebration from "./CompletionCelebration";
import HeroProjectCard from "./HeroProjectCard";
import ModuleTimeline from "./ModuleTimeline";
import PathDetailModal from "./PathDetailModal";
import UnenrollConfirmModal from "./UnenrollConfirmModal";

interface EnrolledViewProps {
  course: CourseDetail;
  onBack: () => void;
  labels: Record<string, string>;
  commonLabels: Record<string, string>;
}

interface HeroResolution {
  hero: Module;
  heroIndex: number;
  heroIsLastCompleted: boolean;
  nextModuleAfterHero: Module | null;
}

function resolveHeroModule(modules: Module[]): HeroResolution | null {
  if (modules.length === 0) return null;

  // 1. First incomplete module with CURRENT status
  const currentIdx = modules.findIndex(
    (m) => !m.selectedProject?.completed && m.schedule?.status === "CURRENT"
  );
  if (currentIdx !== -1) {
    const nextIncomplete = modules.find(
      (m, i) => i > currentIdx && !m.selectedProject?.completed
    );
    return {
      hero: modules[currentIdx],
      heroIndex: currentIdx,
      heroIsLastCompleted: false,
      nextModuleAfterHero: nextIncomplete || null,
    };
  }

  // 2. First incomplete module (any status)
  const firstIncompleteIdx = modules.findIndex(
    (m) => !m.selectedProject?.completed
  );
  if (firstIncompleteIdx !== -1) {
    const nextIncomplete = modules.find(
      (m, i) => i > firstIncompleteIdx && !m.selectedProject?.completed
    );
    return {
      hero: modules[firstIncompleteIdx],
      heroIndex: firstIncompleteIdx,
      heroIsLastCompleted: false,
      nextModuleAfterHero: nextIncomplete || null,
    };
  }

  // 3. Last completed module (all done — show for "advance to next" CTA)
  const lastCompletedIdx = modules.length - 1;
  return {
    hero: modules[lastCompletedIdx],
    heroIndex: lastCompletedIdx,
    heroIsLastCompleted: true,
    nextModuleAfterHero: null,
  };
}

export default function EnrolledView({
  course,
  onBack,
  labels,
  commonLabels,
}: EnrolledViewProps) {
  const [showPathDetail, setShowPathDetail] = useState(false);
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);

  const unenrollMutation = useUnenrollCourse();
  const selectProjectMutation = useSelectProject();
  const completeProjectMutation = useCompleteProject();

  const completedCount = course.modules.filter(
    (m) => m.selectedProject?.completed
  ).length;
  const totalCount = course.modules.length;
  const allCompleted = completedCount === totalCount && totalCount > 0;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const heroResolution = resolveHeroModule(course.modules);

  async function handleUnenroll() {
    try {
      await unenrollMutation.mutateAsync(course.id);
      onBack();
    } catch {
      // error handled by mutation
    }
  }

  return (
    <View className="flex-1 bg-theme-bg">
      <CourseHeader
        title={course.normalized_title}
        isEnrolled
        onBack={onBack}
        onInfo={() => setShowPathDetail(true)}
        onQuit={() => setShowUnenrollConfirm(true)}
        labels={{
          back: commonLabels.back || "back",
          info: "INFO",
          quit: labels.unenroll || "QUIT",
        }}
      />

      <ScrollView className="flex-1 px-4 py-6">
        {totalCount > 0 && (
          <ProgressSection
            completedCount={completedCount}
            totalCount={totalCount}
          />
        )}

        {allCompleted ? (
          <CompletionCelebration
            labels={{
              pathComplete: labels.pathComplete || "PATH COMPLETE",
              completionMessage:
                labels.completionMessage ||
                "Every step you took brought you closer to mastery.",
            }}
          />
        ) : (
          heroResolution && (
            <HeroProjectCard
              mod={heroResolution.hero}
              index={heroResolution.heroIndex}
              courseId={course.id}
              heroIsLastCompleted={heroResolution.heroIsLastCompleted}
              nextModuleTitle={
                heroResolution.nextModuleAfterHero?.title || null
              }
              onSelectProject={(params) =>
                selectProjectMutation.mutate(params)
              }
              onCompleteProject={(params) =>
                completeProjectMutation.mutate(params)
              }
              isSelectLoading={selectProjectMutation.isPending}
              isCompleteLoading={completeProjectMutation.isPending}
            />
          )
        )}

        {totalCount > 0 && (
          <ModuleTimeline
            modules={course.modules}
            heroIndex={heroResolution?.heroIndex ?? null}
          />
        )}
      </ScrollView>

      <PathDetailModal
        visible={showPathDetail}
        onClose={() => setShowPathDetail(false)}
        course={course}
        labels={{
          background: labels.yourBackground || "BACKGROUND",
          studyCadence: labels.studyCadence || "STUDY CADENCE",
        }}
      />

      <UnenrollConfirmModal
        visible={showUnenrollConfirm}
        onClose={() => setShowUnenrollConfirm(false)}
        title={course.normalized_title}
        completedCount={completedCount}
        totalCount={totalCount}
        progressPct={progressPct}
        onConfirm={() => {
          setShowUnenrollConfirm(false);
          handleUnenroll();
        }}
        isLoading={unenrollMutation.isPending}
        labels={{
          keepGoing: labels.keepGoing || "KEEP GOING",
          quitAnyway: labels.quitAnyway || "QUIT ANYWAY",
        }}
      />
    </View>
  );
}

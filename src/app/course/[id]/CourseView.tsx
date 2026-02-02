"use client";

import { useRouter } from "next/navigation";
import { CourseDetailSkeleton } from "@/app/components/PageLoader";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import { useI18n } from "@/lib/i18n";
import { useCourse } from "./CourseContext";
import {
  CourseHeader,
  PathDetailModal,
  ProgressBar,
  CompletionCelebration,
  HeroProjectCard,
  ModuleTimeline,
  EnrollmentSection,
  UnenrollDialog,
  UnenrolledModuleList,
} from "./components";

export default function CourseView() {
  const router = useRouter();
  const {
    course,
    isEnrolled,
    loading,
    isError,
    queryError,
    hasModules,
    hasSchedule,
    completedCount,
    totalCount,
    allCompleted,
    heroModule,
    heroIsLastCompleted,
    nextModuleAfterHero,
    commitmentValidation,
    expandedModules,
    showUnenrollDialog,
    setShowUnenrollDialog,
    showPathDetail,
    setShowPathDetail,
    unenrollError,
    setUnenrollError,
    commitmentIntervalDays,
    setCommitmentIntervalDays,
    enrollError,
    setEnrollError,
    enrollMutation,
    unenrollMutation,
    handleEnroll,
    handleUnenroll,
    toggleModule,
    courseId,
  } = useCourse();

  const { t } = useI18n();
  const cr = t.course as Record<string, string>;
  const c = t.common as Record<string, string>;
  const l = t.learn as Record<string, string>;

  const expertiseLevelLabels: Record<string, string> = {
    "No clue": l.expertiseNoClue,
    "Beginner": l.expertiseBeginner,
    "Intermediate": l.expertiseIntermediate,
    "Advanced": l.expertiseAdvanced,
    "Expert": l.expertiseExpert,
  };

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  if (isError || !course) {
    const errorMessage =
      (queryError as Error & { status?: number })?.status === 404
        ? ERROR_MESSAGES.COURSE_NOT_FOUND
        : (queryError as Error)?.message || ERROR_MESSAGES.COURSE_LOAD_FAILED;

    return (
      <div className="terminal-screen min-h-screen font-mono">
        <div className="terminal-vignette" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-red-400 text-lg">
            <span className="text-red-600">{">"}</span> {errorMessage}
          </p>
          <button
            onClick={() => router.push("/app")}
            className="px-4 py-2 rounded-lg border border-theme-border text-theme-primary hover:bg-theme-surface-hover transition-colors"
          >
            {cr.backToDashboard || "Back to Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  /* ─── Enrolled View ──────────────────────────────────────────── */
  if (isEnrolled) {
    return (
      <div className="terminal-screen min-h-screen font-mono">
        <div className="terminal-vignette" />

        <CourseHeader
          title={course.normalized_title}
          isEnrolled={true}
          onShowPathDetail={() => setShowPathDetail(true)}
          onShowUnenrollDialog={() => setShowUnenrollDialog(true)}
        />

        <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <ErrorBoundary>
            {/* Progress Bar */}
            {hasModules && (
              <ProgressBar completedCount={completedCount} totalCount={totalCount} />
            )}

            {/* Completion Celebration or Hero Project */}
            {allCompleted ? (
              <CompletionCelebration pathTitle={course.normalized_title} />
            ) : heroModule ? (
              <HeroProjectCard
                mod={heroModule}
                courseId={courseId}
                isLastCompleted={heroIsLastCompleted}
                nextModule={nextModuleAfterHero}
              />
            ) : null}

            {/* Module Timeline */}
            {hasModules && hasSchedule && (
              <ModuleTimeline
                modules={course.modules}
                currentModuleId={heroModule?.id ?? null}
                courseId={courseId}
                expandedModules={expandedModules}
                toggleModule={toggleModule}
              />
            )}
          </ErrorBoundary>
        </main>

        {/* Path Detail Modal */}
        {showPathDetail && (
          <PathDetailModal
            course={course}
            onClose={() => setShowPathDetail(false)}
          />
        )}

        {/* Unenroll Confirmation Dialog */}
        {showUnenrollDialog && (
          <UnenrollDialog
            isPending={unenrollMutation.isPending}
            error={unenrollError}
            onConfirm={handleUnenroll}
            onCancel={() => {
              setShowUnenrollDialog(false);
              setUnenrollError(null);
            }}
          />
        )}
      </div>
    );
  }

  /* ─── Unenrolled View ────────────────────────────────────────── */
  return (
    <div className="terminal-screen min-h-screen font-mono">
      <div className="terminal-vignette" />

      <CourseHeader
        title={course.normalized_title}
        isEnrolled={false}
        onShowPathDetail={() => setShowPathDetail(true)}
        onShowUnenrollDialog={() => setShowUnenrollDialog(true)}
      />

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          {/* Course Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-theme-primary mb-2 tracking-wide">
              <span className="text-theme-secondary">{">"}</span>{" "}
              {course.normalized_title}
            </h2>
            <p className="text-theme-secondary text-lg mb-4">
              {course.learning_goal}
            </p>
            <p className="text-theme-muted leading-relaxed">
              {course.learning_goal_details}
            </p>
          </div>

          {/* Course Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="rounded-lg border border-theme-border bg-theme-surface p-4">
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">
                {cr.stepsLabel || "Steps"}
              </p>
              <p className="text-xl font-bold text-theme-primary">
                {course.total_modules}
              </p>
            </div>
            <div className="rounded-lg border border-theme-border bg-theme-surface p-4">
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">
                {cr.yourLevel || "Your Level"}
              </p>
              <p className="text-sm font-semibold text-theme-primary">
                {expertiseLevelLabels[course.expertise_level] || course.expertise_level}
              </p>
            </div>
            <div className="rounded-lg border border-theme-border bg-theme-surface p-4">
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">
                {cr.targetLevel || "Target Level"}
              </p>
              <p className="text-sm font-semibold text-theme-primary">
                {course.expected_skill_level}
              </p>
            </div>
            <div className="rounded-lg border border-theme-border bg-theme-surface p-4">
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">
                {cr.successRate || "Success Rate"}
              </p>
              <p className="text-xl font-bold text-theme-primary">
                {course.likelihood_of_learning}%
              </p>
            </div>
          </div>

          {/* Expertise Details */}
          {course.expertise_details && (
            <div className="rounded-lg border border-theme-border bg-theme-surface p-4 mb-8">
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-2">
                {cr.yourBackground || "Your Background"}
              </p>
              <p className="text-theme-secondary text-sm leading-relaxed">
                {course.expertise_details}
              </p>
            </div>
          )}

          {/* Enrollment CTA */}
          <EnrollmentSection
            totalModules={course.total_modules}
            commitmentIntervalDays={commitmentIntervalDays}
            setCommitmentIntervalDays={setCommitmentIntervalDays}
            enrollError={enrollError}
            setEnrollError={setEnrollError}
            onEnroll={handleEnroll}
            isEnrolling={enrollMutation.isPending}
            commitmentValidation={commitmentValidation}
          />

          {/* Modules List (unenrolled -- title-only, no projects) */}
          {hasModules && (
            <UnenrolledModuleList modules={course.modules} />
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

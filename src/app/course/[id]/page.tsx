"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  useCourseDetail,
  useEnrollCourse,
  useUnenrollCourse,
} from "@/lib/hooks/queries";
import { CourseDetailSkeleton } from "../../components/PageLoader";

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set()
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);
  const [unenrollError, setUnenrollError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // TanStack Query hooks
  const {
    data: courseData,
    isLoading: loading,
    isError,
    error: queryError,
  } = useCourseDetail(id);

  const enrollMutation = useEnrollCourse();
  const unenrollMutation = useUnenrollCourse();

  const course = courseData?.course ?? null;
  const isEnrolled = courseData?.isEnrolled ?? false;
  const isOwner = courseData?.isOwner ?? false;
  const isAuthenticated = courseData?.isAuthenticated ?? false;

  async function handleEnroll() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      await enrollMutation.mutateAsync({ courseId: id, isOwner });
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 401) {
        router.push("/login");
        return;
      }
      // 409 means already enrolled — the cache will refresh via invalidation
    }
  }

  // Close menu when clicking outside
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

  async function handleUnenroll() {
    setUnenrollError(null);
    try {
      await unenrollMutation.mutateAsync(id);
      setShowUnenrollDialog(false);
      setExpandedModules(new Set());
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 404) {
        router.push("/");
        return;
      }
      setUnenrollError(
        (err as Error)?.message || "Failed to unenroll. Please try again."
      );
    }
  }

  function toggleModule(moduleIndex: number) {
    if (!isEnrolled) return;
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleIndex)) {
        next.delete(moduleIndex);
      } else {
        next.add(moduleIndex);
      }
      return next;
    });
  }

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  if (isError || !course) {
    const errorMessage =
      (queryError as Error & { status?: number })?.status === 404
        ? "Course not found"
        : (queryError as Error)?.message || "Failed to load course";

    return (
      <div className="terminal-screen min-h-screen font-mono">
        <div className="terminal-vignette" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-red-400 text-lg">
            <span className="text-red-600">{">"}</span> {errorMessage}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasModules = course.modules.length > 0;

  return (
    <div className="terminal-screen min-h-screen font-mono">
      <div className="terminal-vignette" />

      {/* Top Bar */}
      <header className="relative z-20 border-b border-green-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-green-600 hover:text-green-400 transition-colors flex items-center gap-2"
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
                <path d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Back</span>
            </button>
            <div className="h-6 w-px bg-green-900/50" />
            <h1 className="text-xl font-semibold text-green-400 tracking-wider truncate flex-1">
              {course.normalized_title}
            </h1>

            {/* Three-dot overflow menu — only shown when enrolled */}
            {isEnrolled && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="p-2 text-green-600 hover:text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                  aria-label="Course options"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 rounded-lg border border-green-900/60 bg-green-950 shadow-lg z-30">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowUnenrollDialog(true);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-green-900/40 transition-colors rounded-lg"
                    >
                      Unenroll
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-green-400 mb-2 tracking-wide">
            <span className="text-green-600">{">"}</span>{" "}
            {course.normalized_title}
          </h2>
          <p className="text-green-500 text-lg mb-4">
            {course.learning_goal}
          </p>
          <p className="text-green-600 leading-relaxed">
            {course.learning_goal_details}
          </p>
        </div>

        {/* Course Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
              Modules
            </p>
            <p className="text-xl font-bold text-green-400">
              {course.total_modules}
            </p>
          </div>
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
              Your Level
            </p>
            <p className="text-sm font-semibold text-green-400">
              {course.expertise_level}
            </p>
          </div>
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
              Target Level
            </p>
            <p className="text-sm font-semibold text-green-400">
              {course.expected_skill_level}
            </p>
          </div>
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
              Success Rate
            </p>
            <p className="text-xl font-bold text-green-400">
              {course.likelihood_of_learning}%
            </p>
          </div>
        </div>

        {/* Expertise Details */}
        {course.expertise_details && (
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4 mb-8">
            <p className="text-xs text-green-700 uppercase tracking-wider mb-2">
              Your Background
            </p>
            <p className="text-green-500 text-sm leading-relaxed">
              {course.expertise_details}
            </p>
          </div>
        )}

        {/* Enrollment CTA */}
        <div className="mb-8">
          {isEnrolled ? (
            <button
              disabled
              className="w-full py-3 px-6 rounded-lg border border-green-900/60 bg-green-950/30 text-green-700 font-semibold tracking-wider cursor-not-allowed"
            >
              Already Enrolled
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrollMutation.isPending}
              className="w-full py-3 px-6 rounded-lg border border-green-500/60 bg-green-900/40 text-green-400 font-semibold tracking-wider hover:bg-green-900/60 hover:border-green-400/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrollMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Enrolling...
                </span>
              ) : (
                "Start Now"
              )}
            </button>
          )}
        </div>

        {/* Modules List */}
        {hasModules && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4 tracking-wide">
              <span className="text-green-600">{">"}</span> Course Modules
              <span className="text-sm font-normal text-green-700 ml-2">
                ({course.modules.length} module
                {course.modules.length !== 1 ? "s" : ""})
              </span>
            </h3>

            <div className="space-y-2">
              {course.modules.map((mod) => {
                const isExpanded = expandedModules.has(mod.module_index);
                return (
                  <div
                    key={mod.id}
                    className="rounded-lg border border-green-900/60 bg-green-950/20 overflow-hidden"
                  >
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(mod.module_index)}
                      className={`w-full p-4 text-left flex items-start gap-4 transition-colors ${
                        isEnrolled
                          ? "hover:bg-green-950/40 cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-green-800/50 bg-green-950/50 text-sm font-bold text-green-400">
                        {mod.module_index}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-green-400">
                          {mod.title}
                        </h4>
                        {isEnrolled && (
                          <p className="text-sm text-green-700 mt-1">
                            {mod.description}
                          </p>
                        )}
                      </div>
                      {isEnrolled && (
                        <svg
                          className={`h-5 w-5 text-green-600 flex-shrink-0 mt-1 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* Projects (expanded) — only for enrolled users */}
                    {isEnrolled &&
                      isExpanded &&
                      mod.projects.length > 0 && (
                        <div className="border-t border-green-900/40 px-4 py-3 space-y-3">
                          <p className="text-xs text-green-700 uppercase tracking-wider">
                            Project Options
                          </p>
                          {mod.projects.map((project) => (
                            <div
                              key={project.id}
                              className="rounded border border-green-900/40 bg-green-950/30 p-4"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-green-700 border border-green-900/40 rounded px-1.5 py-0.5">
                                  Option {project.project_index}
                                </span>
                                <h5 className="font-semibold text-green-400 text-sm">
                                  {project.title}
                                </h5>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
                                    Objective
                                  </p>
                                  <p className="text-sm text-green-500 leading-relaxed">
                                    {project.objective}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
                                    Instructions
                                  </p>
                                  <p className="text-sm text-green-600 leading-relaxed">
                                    {project.instructions}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>

            {/* Hint for unenrolled users */}
            {!isEnrolled && (
              <p className="text-sm text-green-700 mt-4 text-center">
                Enroll to unlock module details and project options.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Unenroll Confirmation Dialog */}
      {showUnenrollDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => {
              if (!unenrollMutation.isPending) {
                setShowUnenrollDialog(false);
                setUnenrollError(null);
              }
            }}
          />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-lg border border-green-900/60 bg-green-950 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Already leaving?
            </h3>
            <p className="text-green-500 text-sm leading-relaxed mb-6">
              You&apos;ve been doing so well! Are you sure you want to unenroll
              from this course? Your progress won&apos;t be saved.
            </p>

            {unenrollError && (
              <p className="text-red-400 text-sm mb-4 px-3 py-2 rounded border border-red-900/40 bg-red-950/30">
                {unenrollError}
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowUnenrollDialog(false);
                  setUnenrollError(null);
                }}
                disabled={unenrollMutation.isPending}
                className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUnenroll}
                disabled={unenrollMutation.isPending}
                className="px-4 py-2 rounded-lg border border-red-900/60 bg-red-950/30 text-red-400 hover:bg-red-900/40 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unenrollMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Unenrolling...
                  </span>
                ) : (
                  "Unenroll"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

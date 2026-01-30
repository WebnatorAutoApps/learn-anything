"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useUpcomingProjects,
  useCompleteProject,
} from "@/lib/hooks/queries";
import type { UpcomingProject } from "@/lib/hooks/queries";

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getDueStatus(dueDate: string | null): "overdue" | "soon" | "normal" | "none" {
  if (!dueDate) return "none";
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) return "overdue";
  const soon = new Date();
  soon.setDate(soon.getDate() + 2);
  const soonStr = soon.toISOString().slice(0, 10);
  if (dueDate <= soonStr) return "soon";
  return "normal";
}

function ActiveModuleSlide({
  project,
  onComplete,
  isCompleting,
}: {
  project: UpcomingProject;
  onComplete: (project: UpcomingProject) => void;
  isCompleting: boolean;
}) {
  const router = useRouter();
  const dueStatus = getDueStatus(project.dueDate);

  return (
    <div className="w-full flex-shrink-0 snap-center px-1">
      <div className="rounded-lg border border-green-900/60 bg-green-950/30 p-5">
        {/* Course name header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push(`/course/${project.courseId}`)}
            className="text-sm font-semibold text-green-500 hover:text-green-400 transition-colors truncate"
          >
            {project.courseName}
          </button>
          <span className="text-xs text-green-800 flex-shrink-0 ml-2">
            Module {project.moduleIndex} / {project.totalModules}
          </span>
        </div>

        {/* Module info */}
        <div className="mb-3">
          <h4 className="text-base font-semibold text-green-400 mb-1">
            {project.moduleName}
          </h4>
          <div className="flex items-center gap-2 text-xs text-green-700">
            <span>Project {project.projectIndex}: {project.title}</span>
          </div>
        </div>

        {/* Due date */}
        <div className="flex items-center justify-between">
          <div>
            {project.dueDate ? (
              <span
                className={`text-xs ${
                  dueStatus === "overdue"
                    ? "text-red-400"
                    : dueStatus === "soon"
                      ? "text-yellow-500"
                      : "text-green-700"
                }`}
              >
                {dueStatus === "overdue" ? "Overdue — " : "Due "}
                {formatDueDate(project.dueDate)}
              </span>
            ) : (
              <span className="text-xs text-green-800 italic">No due date</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/course/${project.courseId}`)}
              className="px-3 py-1.5 text-xs rounded border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors"
            >
              View
            </button>
            <button
              onClick={() => onComplete(project)}
              disabled={isCompleting}
              className="px-3 py-1.5 text-xs rounded bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              aria-label={`Mark module "${project.moduleName}" as complete`}
            >
              {isCompleting ? (
                <>
                  <svg
                    className="animate-spin h-3 w-3"
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
                  Completing...
                </>
              ) : (
                <>
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Complete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActiveModuleCarousel() {
  const { data: projects, isLoading } = useUpcomingProjects();
  const completeMutation = useCompleteProject();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const projectCount = projects?.length ?? 0;
  const hasMultiple = projectCount > 1;

  // Clamp activeIndex when projects change (e.g. after completion)
  useEffect(() => {
    if (activeIndex >= projectCount && projectCount > 0) {
      setActiveIndex(projectCount - 1);
    }
  }, [projectCount, activeIndex]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;
      const slideWidth = container.offsetWidth;
      container.scrollTo({ left: slideWidth * index, behavior: "smooth" });
    },
    []
  );

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const slideWidth = container.offsetWidth;
    if (slideWidth === 0) return;
    const newIndex = Math.round(container.scrollLeft / slideWidth);
    setActiveIndex(newIndex);
  }, []);

  const goToPrev = useCallback(() => {
    const newIndex = Math.max(0, activeIndex - 1);
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  }, [activeIndex, scrollToIndex]);

  const goToNext = useCallback(() => {
    const newIndex = Math.min(projectCount - 1, activeIndex + 1);
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  }, [activeIndex, projectCount, scrollToIndex]);

  async function handleComplete(project: UpcomingProject) {
    setCompletingId(project.id);
    try {
      await completeMutation.mutateAsync({
        courseId: project.courseId,
        moduleId: project.moduleId,
      });
    } finally {
      setCompletingId(null);
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mb-8 rounded-lg border border-green-900/60 bg-green-950/30 p-5">
        <div className="h-5 w-40 bg-green-900/40 rounded animate-pulse mb-4" />
        <div className="h-4 w-full bg-green-900/30 rounded animate-pulse mb-2" />
        <div className="h-4 w-3/4 bg-green-900/30 rounded animate-pulse mb-3" />
        <div className="h-8 w-24 bg-green-900/30 rounded animate-pulse" />
      </div>
    );
  }

  // Empty state: no active modules
  if (!projects || projects.length === 0) {
    return (
      <div className="mb-8 rounded-lg border border-dashed border-green-900/50 bg-green-950/10 p-6 text-center">
        <svg
          className="h-8 w-8 text-green-800 mx-auto mb-3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-green-600 text-sm">
          No active modules. Start a course or enroll in one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8" role="region" aria-label="Active modules carousel">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-lg font-semibold text-green-400 tracking-wide">
            Active Module
          </h3>
          {hasMultiple && (
            <span className="text-xs text-green-700 ml-1">
              ({activeIndex + 1} of {projectCount} projects)
            </span>
          )}
        </div>

        {/* Arrow controls for desktop */}
        {hasMultiple && (
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              disabled={activeIndex === 0}
              className="p-1.5 rounded border border-green-900/60 text-green-500 hover:bg-green-900/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous project"
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
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              disabled={activeIndex === projectCount - 1}
              className="p-1.5 rounded border border-green-900/60 text-green-500 hover:bg-green-900/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next project"
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
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Carousel container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="list"
        aria-live="polite"
      >
        {projects.map((project) => (
          <div key={project.id} className="w-full flex-shrink-0" role="listitem">
            <ActiveModuleSlide
              project={project}
              onComplete={handleComplete}
              isCompleting={completingId === project.id}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {hasMultiple && (
        <div
          className="flex justify-center gap-1.5 mt-3"
          role="tablist"
          aria-label="Carousel indicators"
        >
          {projects.map((project, index) => (
            <button
              key={project.id}
              onClick={() => {
                setActiveIndex(index);
                scrollToIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex
                  ? "w-6 bg-green-400"
                  : "w-2 bg-green-800 hover:bg-green-600"
              }`}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to ${project.courseName}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

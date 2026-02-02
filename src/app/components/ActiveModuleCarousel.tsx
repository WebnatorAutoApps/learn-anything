"use client";

import { useState, useRef, useCallback } from "react";
import {
  useUpcomingProjects,
  type UpcomingProject,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import ActiveModuleSlide from "./ActiveModuleSlide";
import CompletionModal from "./CompletionModal";

export default function ActiveModuleCarousel() {
  const { t } = useI18n();
  const d = t.dashboard as Record<string, string>;
  const c = t.common as Record<string, string>;
  const { data: projects, isLoading } = useUpcomingProjects();
  const [activeIndex, setActiveIndex] = useState(0);
  const [completingProject, setCompletingProject] = useState<UpcomingProject | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const projectCount = projects?.length ?? 0;
  const hasMultiple = projectCount > 1;

  // Clamp activeIndex when projects change (e.g. after completion)
  const clampedIndex = projectCount > 0 && activeIndex >= projectCount
    ? projectCount - 1
    : activeIndex;

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
    const newIndex = Math.max(0, clampedIndex - 1);
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  }, [clampedIndex, scrollToIndex]);

  const goToNext = useCallback(() => {
    const newIndex = Math.min(projectCount - 1, clampedIndex + 1);
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  }, [clampedIndex, projectCount, scrollToIndex]);

  function handleComplete(project: UpcomingProject) {
    setCompletingProject(project);
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mb-8 rounded-lg border border-theme-border bg-theme-surface p-5">
        <div className="h-5 w-40 bg-theme-surface-hover rounded animate-pulse mb-4" />
        <div className="h-4 w-full bg-theme-surface-hover rounded animate-pulse mb-2" />
        <div className="h-4 w-3/4 bg-theme-surface-hover rounded animate-pulse mb-3" />
        <div className="h-8 w-24 bg-theme-surface-hover rounded animate-pulse" />
      </div>
    );
  }

  // Hide section entirely when there are no active modules
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="mb-8" role="region" aria-label={d.carouselLabel}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-theme-secondary"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-lg font-semibold text-theme-primary tracking-wide">
            {d.activeStep || "Active Step"}
          </h3>
          {hasMultiple && (
            <span className="text-xs text-theme-muted ml-1">
              ({clampedIndex + 1} of {projectCount} {c.projects || "projects"})
            </span>
          )}
        </div>

        {/* Arrow controls for desktop */}
        {hasMultiple && (
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              disabled={clampedIndex === 0}
              className="p-1.5 rounded border border-theme-border text-theme-secondary hover:bg-theme-surface-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={d.previousProject}
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
              disabled={clampedIndex === projectCount - 1}
              className="p-1.5 rounded border border-theme-border text-theme-secondary hover:bg-theme-surface-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={d.nextProject}
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
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {hasMultiple && (
        <div
          className="flex justify-center gap-1.5 mt-3"
          role="tablist"
          aria-label={d.carouselIndicators}
        >
          {projects.map((project, index) => (
            <button
              key={project.id}
              onClick={() => {
                setActiveIndex(index);
                scrollToIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === clampedIndex
                  ? "w-6 bg-theme-primary"
                  : "w-2 bg-theme-primary-faint hover:bg-theme-muted"
              }`}
              role="tab"
              aria-selected={index === clampedIndex}
              aria-label={d.goToProject.replace("{name}", project.courseName)}
            />
          ))}
        </div>
      )}

      {/* Completion Modal */}
      {completingProject && (
        <CompletionModal
          project={completingProject}
          onClose={() => setCompletingProject(null)}
          onCompleted={() => setCompletingProject(null)}
        />
      )}
    </div>
  );
}

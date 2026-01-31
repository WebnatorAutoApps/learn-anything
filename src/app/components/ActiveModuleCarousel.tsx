"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useUpcomingProjects,
  useCompleteProject,
  useUploadCompletionImage,
} from "@/lib/hooks/queries";
import type { UpcomingProject } from "@/lib/hooks/queries";

const MAX_COMMENT_LENGTH = 2000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

function CompletionModal({
  project,
  onClose,
  onCompleted,
}: {
  project: UpcomingProject;
  onClose: () => void;
  onCompleted: () => void;
}) {
  const completeMutation = useCompleteProject();
  const uploadMutation = useUploadCompletionImage();
  const [comment, setComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = completeMutation.isPending || uploadMutation.isPending;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError("Invalid file type. Accepted formats: JPEG, PNG, WebP");
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File too large. Maximum size is 10 MB");
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function clearFile() {
    setSelectedFile(null);
    setImagePreview(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    let imageUrl: string | undefined;

    if (selectedFile) {
      try {
        imageUrl = await uploadMutation.mutateAsync(selectedFile);
      } catch {
        return;
      }
    }

    await completeMutation.mutateAsync({
      courseId: project.courseId,
      moduleId: project.moduleId,
      comment: comment.trim() || undefined,
      imageUrl,
    });

    onCompleted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg border border-theme-border bg-theme-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-theme-primary mb-1">
          Complete Step
        </h3>
        <p className="text-sm text-theme-muted mb-4">
          {project.courseName} — {project.moduleName}
        </p>

        {/* Comment textarea */}
        <div className="mb-4">
          <label className="block text-xs text-theme-muted uppercase tracking-wider mb-1">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            placeholder="Share your thoughts on this project..."
            rows={3}
            className="w-full rounded border border-theme-border bg-theme-surface text-theme-primary text-sm px-3 py-2 placeholder:text-theme-primary-faint focus:outline-none focus:border-theme-primary resize-y"
            disabled={isSubmitting}
          />
          <p className="text-xs text-theme-primary-faint mt-0.5 text-right">
            {comment.length}/{MAX_COMMENT_LENGTH}
          </p>
        </div>

        {/* Image upload */}
        <div className="mb-4">
          <label className="block text-xs text-theme-muted uppercase tracking-wider mb-1">
            Image (optional)
          </label>

          {imagePreview ? (
            <div className="space-y-2">
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-48 rounded border border-theme-border object-contain"
                />
                <button
                  onClick={clearFile}
                  disabled={isSubmitting}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-900/80 border border-red-700/50 text-red-400 flex items-center justify-center text-xs hover:bg-red-800/80 transition-colors disabled:opacity-50"
                  aria-label="Remove image"
                >
                  X
                </button>
              </div>
              <p className="text-xs text-theme-muted">
                {selectedFile?.name}
              </p>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded border border-dashed border-theme-border bg-theme-surface text-theme-muted text-sm hover:bg-theme-surface-hover hover:border-theme-border-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Click to upload an image (JPEG, PNG, WebP, max 10 MB)
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {fileError && (
            <p className="text-xs text-red-400 mt-1">{fileError}</p>
          )}

          {uploadMutation.isError && (
            <p className="text-xs text-red-400 mt-1">
              Upload failed: {uploadMutation.error?.message || "Unknown error"}. Please try again.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-theme-border text-theme-primary hover:bg-theme-surface-hover transition-colors text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold text-sm hover:bg-theme-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
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
                {uploadMutation.isPending ? "Uploading..." : "Completing..."}
              </>
            ) : (
              "Mark as Completed"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActiveModuleSlide({
  project,
  onComplete,
}: {
  project: UpcomingProject;
  onComplete: (project: UpcomingProject) => void;
}) {
  const router = useRouter();
  const dueStatus = getDueStatus(project.dueDate);

  return (
    <div className="w-full flex-shrink-0 snap-center px-1">
      <div className="rounded-lg border border-theme-border bg-theme-surface p-5">
        {/* Course name header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push(`/course/${project.courseId}`)}
            className="text-sm font-semibold text-theme-secondary hover:text-theme-primary transition-colors truncate"
          >
            {project.courseName}
          </button>
          <span className="text-xs text-theme-primary-faint flex-shrink-0 ml-2">
            Step {project.moduleIndex} / {project.totalModules}
          </span>
        </div>

        {/* Module info */}
        <div className="mb-3">
          <h4 className="text-base font-semibold text-theme-primary mb-1">
            {project.moduleName}
          </h4>
          <div className="flex items-center gap-2 text-xs text-theme-muted">
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
                      : "text-theme-muted"
                }`}
              >
                {dueStatus === "overdue" ? "Overdue — " : "Due "}
                {formatDueDate(project.dueDate)}
              </span>
            ) : (
              <span className="text-xs text-theme-primary-faint italic">No due date</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/course/${project.courseId}`)}
              className="px-3 py-1.5 text-xs rounded border border-theme-border text-theme-primary hover:bg-theme-surface-hover transition-colors"
            >
              View
            </button>
            <button
              onClick={() => onComplete(project)}
              className="px-3 py-1.5 text-xs rounded bg-theme-accent text-theme-text-on-accent font-semibold hover:bg-theme-primary-hover transition-colors flex items-center gap-1.5"
              aria-label={`Mark step "${project.moduleName}" as complete`}
            >
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActiveModuleCarousel() {
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

  // Empty state: no active modules
  if (!projects || projects.length === 0) {
    return (
      <div className="mb-8 rounded-lg border border-dashed border-theme-border bg-theme-surface p-6 text-center">
        <svg
          className="h-8 w-8 text-theme-primary-faint mx-auto mb-3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-theme-muted text-sm">
          No active steps. Start a learning path or enroll in one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8" role="region" aria-label="Active steps carousel">
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
            Active Step
          </h3>
          {hasMultiple && (
            <span className="text-xs text-theme-muted ml-1">
              ({clampedIndex + 1} of {projectCount} projects)
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
              disabled={clampedIndex === projectCount - 1}
              className="p-1.5 rounded border border-theme-border text-theme-secondary hover:bg-theme-surface-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                index === clampedIndex
                  ? "w-6 bg-theme-primary"
                  : "w-2 bg-theme-primary-faint hover:bg-theme-muted"
              }`}
              role="tab"
              aria-selected={index === clampedIndex}
              aria-label={`Go to ${project.courseName}`}
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

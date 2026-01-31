"use client";

import { useState, useEffect, useRef, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import {
  useCourseDetail,
  useEnrollCourse,
  useUnenrollCourse,
  useSelectProject,
  useCompleteProject,
  useUploadCompletionImage,
} from "@/lib/hooks/queries";
import type { ModuleSchedule, Module, Project } from "@/lib/hooks/queries";
import { CourseDetailSkeleton } from "../../components/PageLoader";
import { validateCommitment } from "@/lib/schedule";

const MAX_COMMENT_LENGTH = 2000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const CADENCE_OPTIONS = [
  { value: 1, label: "Every day" },
  { value: 2, label: "Every 2 days" },
  { value: 3, label: "Every 3 days" },
  { value: 5, label: "Every 5 days" },
  { value: 7, label: "Weekly" },
  { value: 14, label: "Biweekly" },
  { value: 30, label: "Monthly" },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function ProjectSelectionArea({
  mod,
  courseId,
}: {
  mod: Module;
  courseId: string;
}) {
  const selectMutation = useSelectProject();
  const completeMutation = useCompleteProject();
  const uploadMutation = useUploadCompletionImage();

  const [comment, setComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selection = mod.selectedProject;
  const hasSelection = !!selection;
  const selectedProjectId = selection?.projectId ?? null;
  const isCompleted = selection?.completed ?? false;

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

  async function handleSelect(project: Project) {
    await selectMutation.mutateAsync({
      courseId,
      moduleId: mod.id,
      projectId: project.id,
    });
  }

  const isSubmitting = completeMutation.isPending || uploadMutation.isPending;

  async function handleComplete() {
    let imageUrl: string | undefined;

    // Upload image first if one is selected
    if (selectedFile) {
      try {
        imageUrl = await uploadMutation.mutateAsync(selectedFile);
      } catch {
        // Upload error is surfaced via uploadMutation.error
        return;
      }
    }

    await completeMutation.mutateAsync({
      courseId,
      moduleId: mod.id,
      comment: comment.trim() || undefined,
      imageUrl,
    });

    // Reset form state after successful completion
    setComment("");
    clearFile();
  }

  if (mod.projects.length === 0) {
    return (
      <p className="text-sm text-green-700 italic">
        No projects available for this step.
      </p>
    );
  }

  // No project selected — show prompt + all project cards (title + objective only)
  if (!hasSelection) {
    return (
      <div className="space-y-3">
        <div className="rounded border border-yellow-800/40 bg-yellow-950/20 px-4 py-3">
          <p className="text-sm text-yellow-600 font-medium">
            <span className="text-yellow-700 mr-1">{"> "}</span>
            Choose a project to work on
          </p>
        </div>
        {mod.projects.map((project) => (
          <div
            key={project.id}
            className="rounded border border-green-900/40 bg-green-950/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-green-700 border border-green-900/40 rounded px-1.5 py-0.5">
                    Option {project.project_index}
                  </span>
                  <h5 className="font-semibold text-green-400 text-sm">
                    {project.title}
                  </h5>
                </div>
                <p className="text-sm text-green-500 leading-relaxed">
                  {project.objective}
                </p>
              </div>
              <button
                onClick={() => handleSelect(project)}
                disabled={selectMutation.isPending}
                className="flex-shrink-0 px-3 py-1.5 rounded border border-green-500/50 bg-green-900/30 text-green-400 text-xs font-medium hover:bg-green-900/50 hover:border-green-400/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectMutation.isPending ? "..." : "Select"}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Project selected — show selected project prominently, others greyed out
  const selectedProject = mod.projects.find(
    (p) => p.id === selectedProjectId
  );

  return (
    <div className="space-y-3">
      {/* Selected project — full details with instructions */}
      {selectedProject && (
        <div
          className={`rounded border-2 p-4 ${
            isCompleted
              ? "border-green-600/50 bg-green-950/40"
              : "border-green-500/50 bg-green-950/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-green-400 border border-green-500/40 rounded px-1.5 py-0.5 bg-green-900/30">
              {isCompleted ? "COMPLETED" : "SELECTED"}
            </span>
            <h5 className="font-semibold text-green-400 text-sm">
              {selectedProject.title}
            </h5>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
                Objective
              </p>
              <p className="text-sm text-green-500 leading-relaxed">
                {selectedProject.objective}
              </p>
            </div>
            <div>
              <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
                Instructions
              </p>
              <p className="text-sm text-green-600 leading-relaxed">
                {selectedProject.instructions}
              </p>
            </div>
          </div>

          {/* Completion section */}
          <div className="mt-4">
            {isCompleted ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-500 text-sm">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">
                    Project completed
                    {selection?.completedAt && (
                      <span className="text-green-700 font-normal ml-1">
                        — {new Date(selection.completedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </span>
                    )}
                  </span>
                </div>

                {/* Display submitted comment */}
                {selection?.comment && (
                  <div className="rounded border border-green-900/40 bg-green-950/30 p-3">
                    <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
                      Your Comment
                    </p>
                    <p className="text-sm text-green-500 leading-relaxed whitespace-pre-wrap">
                      {selection.comment}
                    </p>
                  </div>
                )}

                {/* Display submitted image */}
                {selection?.imageUrl && (
                  <div className="rounded border border-green-900/40 bg-green-950/30 p-3">
                    <p className="text-xs text-green-700 uppercase tracking-wider mb-2">
                      Uploaded Image
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selection.imageUrl}
                      alt="Completion submission"
                      className="max-w-full max-h-64 rounded border border-green-900/40 object-contain"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Comment textarea */}
                <div>
                  <label className="block text-xs text-green-700 uppercase tracking-wider mb-1">
                    Comment (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={MAX_COMMENT_LENGTH}
                    placeholder="Share your thoughts on this project..."
                    rows={3}
                    className="w-full rounded border border-green-900/50 bg-green-950/40 text-green-400 text-sm px-3 py-2 placeholder:text-green-800 focus:outline-none focus:border-green-500/60 resize-y"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-green-800 mt-0.5 text-right">
                    {comment.length}/{MAX_COMMENT_LENGTH}
                  </p>
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-xs text-green-700 uppercase tracking-wider mb-1">
                    Image (optional)
                  </label>

                  {imagePreview ? (
                    <div className="space-y-2">
                      <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-48 rounded border border-green-900/40 object-contain"
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
                      <p className="text-xs text-green-700">
                        {selectedFile?.name}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded border border-dashed border-green-900/50 bg-green-950/20 text-green-600 text-sm hover:bg-green-950/30 hover:border-green-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Complete button */}
                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg border border-green-500/50 bg-green-900/30 text-green-400 font-medium text-sm hover:bg-green-900/50 hover:border-green-400/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
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
                      {uploadMutation.isPending ? "Uploading image..." : "Marking..."}
                    </span>
                  ) : (
                    "Mark as Completed"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-selected projects — greyed out, title + objective only */}
      {mod.projects
        .filter((p) => p.id !== selectedProjectId)
        .map((project) => (
          <div
            key={project.id}
            className="rounded border border-green-900/20 bg-green-950/10 p-4 opacity-40"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-green-800 border border-green-900/30 rounded px-1.5 py-0.5">
                Option {project.project_index}
              </span>
              <h5 className="font-semibold text-green-700 text-sm">
                {project.title}
              </h5>
            </div>
            <p className="text-sm text-green-800 leading-relaxed">
              {project.objective}
            </p>
          </div>
        ))}
    </div>
  );
}

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
  const [commitmentIntervalDays, setCommitmentIntervalDays] = useState(3);
  const [enrollError, setEnrollError] = useState<string | null>(null);
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

  // Client-side validation of the selected commitment
  const commitmentValidation = useMemo(() => {
    if (!course) return null;
    return validateCommitment(course.total_modules, commitmentIntervalDays);
  }, [course, commitmentIntervalDays]);

  async function handleEnroll() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setEnrollError(null);

    try {
      await enrollMutation.mutateAsync({
        courseId: id,
        isOwner,
        commitmentIntervalDays,
      });
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 401) {
        router.push("/login");
        return;
      }
      if (status === 422) {
        // Server-side validation caught the same issue — already shown client-side
        return;
      }
      if (status === 409) {
        // Already enrolled — the cache will refresh via invalidation
        return;
      }
      setEnrollError(
        (err as Error)?.message || "Failed to enroll. Please try again."
      );
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

  function toggleModule(moduleIndex: number, schedule: ModuleSchedule | null) {
    // Only allow expanding CURRENT modules (unlocked)
    if (!isEnrolled) return;
    if (schedule && schedule.status !== "CURRENT") return;
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
        ? "Learning path not found"
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
  const hasSchedule =
    isEnrolled && course.modules.some((m) => m.schedule !== null);

  // Separate current module from the rest for highlighted display
  const currentModule = hasSchedule
    ? course.modules.find(
        (m) => m.schedule?.status === "CURRENT" && m.module_index ===
          Math.max(
            ...course.modules
              .filter((mod) => mod.schedule?.status === "CURRENT")
              .map((mod) => mod.module_index)
          )
      )
    : null;

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
              Steps
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
            <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4">
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-green-500 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-green-400 font-semibold">Enrolled</p>
                  {course.commitment_interval_days && (
                    <p className="text-sm text-green-600">
                      Studying every {course.commitment_interval_days} day
                      {course.commitment_interval_days !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cadence Selector */}
              <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4">
                <label className="block text-xs text-green-700 uppercase tracking-wider mb-3">
                  How often will you study?
                </label>
                <div className="flex flex-wrap gap-2">
                  {CADENCE_OPTIONS.map((opt) => {
                    const optValidation = validateCommitment(
                      course.total_modules,
                      opt.value
                    );
                    const isSelected = commitmentIntervalDays === opt.value;
                    const isTooLong = !optValidation.valid;

                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setCommitmentIntervalDays(opt.value);
                          setEnrollError(null);
                        }}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          isSelected
                            ? isTooLong
                              ? "border-red-500/60 bg-red-950/40 text-red-400"
                              : "border-green-500/60 bg-green-900/40 text-green-400"
                            : isTooLong
                              ? "border-red-900/40 bg-red-950/20 text-red-700 hover:bg-red-950/30 hover:text-red-500"
                              : "border-green-900/60 bg-green-950/30 text-green-700 hover:bg-green-900/20 hover:text-green-500"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Duration projection */}
                {commitmentValidation && (
                  <div className="mt-3">
                    {commitmentValidation.valid ? (
                      <p className="text-xs text-green-600">
                        Estimated completion: ~{commitmentValidation.projectedDays} days
                        ({course.total_modules} steps)
                      </p>
                    ) : commitmentValidation.suggestedIntervalDays !== null ? (
                      <div className="rounded border border-red-900/40 bg-red-950/20 px-3 py-2.5 mt-1">
                        <p className="text-sm text-red-400 font-medium mb-1">
                          This pace would take ~{commitmentValidation.projectedYears} years
                        </p>
                        <p className="text-xs text-red-500/80 leading-relaxed">
                          Commitments over 1 year rarely lead to completion.
                          Choose a pace of every {commitmentValidation.suggestedIntervalDays} day
                          {commitmentValidation.suggestedIntervalDays !== 1 ? "s" : ""}{" "}
                          or more frequent to enroll.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded border border-red-900/40 bg-red-950/20 px-3 py-2.5 mt-1">
                        <p className="text-sm text-red-400 font-medium mb-1">
                          This learning path has too many steps
                        </p>
                        <p className="text-xs text-red-500/80 leading-relaxed">
                          With {course.total_modules} steps, even a daily
                          commitment would take ~{commitmentValidation.projectedYears} years.
                          This path cannot be completed within 1 year at any pace.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Enroll error */}
              {enrollError && (
                <p className="text-red-400 text-sm px-3 py-2 rounded border border-red-900/40 bg-red-950/30">
                  {enrollError}
                </p>
              )}

              <button
                onClick={handleEnroll}
                disabled={
                  enrollMutation.isPending ||
                  (commitmentValidation !== null && !commitmentValidation.valid)
                }
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
                  `Start Now — ${CADENCE_OPTIONS.find((o) => o.value === commitmentIntervalDays)?.label ?? `Every ${commitmentIntervalDays} Day${commitmentIntervalDays !== 1 ? "s" : ""}`}`
                )}
              </button>
            </div>
          )}
        </div>

        {/* Current Module Highlight (when enrolled with schedule) */}
        {isEnrolled && hasSchedule && currentModule && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4 tracking-wide">
              <span className="text-green-600">{">"}</span> Current Step
            </h3>
            <div className="rounded-lg border-2 border-green-500/60 bg-green-950/30 overflow-hidden shadow-lg shadow-green-900/20">
              <button
                onClick={() =>
                  toggleModule(currentModule.module_index, currentModule.schedule)
                }
                className="w-full p-5 text-left flex items-start gap-4 hover:bg-green-950/40 cursor-pointer transition-colors"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-green-500/50 bg-green-900/40 text-base font-bold text-green-400">
                  {currentModule.module_index}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-green-400 border border-green-500/40 rounded px-1.5 py-0.5 bg-green-900/30">
                      CURRENT
                    </span>
                    {currentModule.schedule && (
                      <span className="text-xs text-green-700">
                        Due {formatDate(currentModule.schedule.dueDate)}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-green-400 text-lg">
                    {currentModule.title}
                  </h4>
                  <p className="text-sm text-green-600 mt-1">
                    {currentModule.description}
                  </p>
                </div>
                <svg
                  className={`h-5 w-5 text-green-500 flex-shrink-0 mt-2 transition-transform ${
                    expandedModules.has(currentModule.module_index)
                      ? "rotate-180"
                      : ""
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
              </button>

              {/* Projects (expanded) */}
              {expandedModules.has(currentModule.module_index) &&
                currentModule.projects.length > 0 && (
                  <div className="border-t border-green-500/30 px-5 py-4">
                    <p className="text-xs text-green-700 uppercase tracking-wider mb-3">
                      Projects
                    </p>
                    <ProjectSelectionArea
                      mod={currentModule}
                      courseId={id}
                    />
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Modules List */}
        {hasModules && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4 tracking-wide">
              <span className="text-green-600">{">"}</span>{" "}
              {isEnrolled && hasSchedule ? "All Steps" : "Learning Path Steps"}
              <span className="text-sm font-normal text-green-700 ml-2">
                ({course.modules.length} step
                {course.modules.length !== 1 ? "s" : ""})
              </span>
            </h3>

            <div className="space-y-2">
              {course.modules.map((mod) => {
                const schedule = mod.schedule;
                const status = schedule?.status ?? null;
                const isLocked =
                  status === "LOCKED" || status === "NEXT_PREVIEW";
                const isCurrent = status === "CURRENT";
                const isNextPreview = status === "NEXT_PREVIEW";
                const isExpanded = expandedModules.has(mod.module_index);

                return (
                  <div
                    key={mod.id}
                    className={`rounded-lg border overflow-hidden transition-colors ${
                      isCurrent && hasSchedule
                        ? "border-green-500/40 bg-green-950/25"
                        : isNextPreview
                          ? "border-yellow-900/40 bg-green-950/15"
                          : isLocked
                            ? "border-green-900/30 bg-green-950/10 opacity-60"
                            : "border-green-900/60 bg-green-950/20"
                    }`}
                  >
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(mod.module_index, schedule)}
                      className={`w-full p-4 text-left flex items-start gap-4 transition-colors ${
                        isEnrolled && !isLocked
                          ? "hover:bg-green-950/40 cursor-pointer"
                          : "cursor-default"
                      }`}
                      disabled={isLocked}
                    >
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border text-sm font-bold ${
                          isCurrent && hasSchedule
                            ? "border-green-500/50 bg-green-900/40 text-green-400"
                            : isNextPreview
                              ? "border-yellow-800/50 bg-yellow-950/30 text-yellow-600"
                              : isLocked
                                ? "border-green-900/30 bg-green-950/30 text-green-800"
                                : "border-green-800/50 bg-green-950/50 text-green-400"
                        }`}
                      >
                        {isLocked ? (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                        ) : (
                          mod.module_index
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Status badges */}
                        {isEnrolled && hasSchedule && schedule && (
                          <div className="flex items-center gap-2 mb-1">
                            {isCurrent && (
                              <span className="text-xs font-mono text-green-400 border border-green-500/40 rounded px-1.5 py-0.5 bg-green-900/30">
                                CURRENT
                              </span>
                            )}
                            {isNextPreview && (
                              <span className="text-xs font-mono text-yellow-600 border border-yellow-800/40 rounded px-1.5 py-0.5 bg-yellow-950/30">
                                UP NEXT
                              </span>
                            )}
                            {status === "LOCKED" && (
                              <span className="text-xs font-mono text-green-800 border border-green-900/40 rounded px-1.5 py-0.5">
                                LOCKED
                              </span>
                            )}
                            <span className="text-xs text-green-700">
                              {isCurrent
                                ? `Due ${formatDate(schedule.dueDate)}`
                                : `Unlocks ${formatDate(schedule.unlockDate)}`}
                            </span>
                          </div>
                        )}
                        <h4
                          className={`font-semibold ${
                            isLocked ? "text-green-700" : "text-green-400"
                          }`}
                        >
                          {mod.title}
                        </h4>
                        {isEnrolled && !isLocked && (
                          <p className="text-sm text-green-700 mt-1">
                            {mod.description}
                          </p>
                        )}
                        {isNextPreview && (
                          <p className="text-sm text-green-800 mt-1">
                            {mod.description}
                          </p>
                        )}
                      </div>
                      {isEnrolled && !isLocked && (
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

                    {/* Projects (expanded) — only for enrolled, unlocked modules */}
                    {isEnrolled &&
                      !isLocked &&
                      isExpanded &&
                      mod.projects.length > 0 && (
                        <div className="border-t border-green-900/40 px-4 py-3">
                          <p className="text-xs text-green-700 uppercase tracking-wider mb-3">
                            Projects
                          </p>
                          <ProjectSelectionArea
                            mod={mod}
                            courseId={id}
                          />
                        </div>
                      )}
                  </div>
                );
              })}
            </div>

            {/* Hint for unenrolled users */}
            {!isEnrolled && (
              <p className="text-sm text-green-700 mt-4 text-center">
                Enroll to unlock step details and project options.
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
              from this learning path? Your progress and schedule won&apos;t be saved.
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

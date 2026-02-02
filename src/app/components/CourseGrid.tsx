"use client";

import { useRouter } from "next/navigation";
import { CourseGridSkeleton } from "./PageLoader";
import type { CourseListItem } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

interface CourseGridProps {
  courses: CourseListItem[];
  isLoading: boolean;
  onLearnClick: () => void;
}

export default function CourseGrid({
  courses,
  isLoading,
  onLearnClick,
}: CourseGridProps) {
  const router = useRouter();
  const { t } = useI18n();
  const d = t.dashboard as Record<string, string>;
  const c = t.common as Record<string, string>;

  if (isLoading) {
    return <CourseGridSkeleton count={3} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <button
          key={course.id}
          onClick={() => router.push(`/course/${course.id}`)}
          className="group relative overflow-hidden rounded-lg border border-theme-border bg-theme-surface p-6 text-left transition-all hover:shadow-[0_0_15px_var(--t-glow)] hover:border-theme-primary hover:bg-theme-surface-hover"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-theme-border bg-theme-surface">
              <span className="text-lg font-bold text-theme-primary">
                {course.normalized_title.charAt(0)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-theme-primary truncate">
                {course.normalized_title}
              </h3>
              <p className="text-sm text-theme-muted">
                {course.total_modules} {c.steps || "steps"}
              </p>
            </div>
          </div>
        </button>
      ))}

      {/* Add New Button */}
      <button
        onClick={onLearnClick}
        className="group relative overflow-hidden rounded-lg border-2 border-dashed border-theme-border bg-theme-bg p-6 text-left transition-all hover:border-theme-primary hover:bg-theme-surface-hover"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-theme-border bg-theme-surface">
            <svg
              className="h-6 w-6 text-theme-secondary"
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
            <h3 className="text-lg font-semibold text-theme-primary">
              {d.learnSomethingNew || "Learn Something New"}
            </h3>
            <p className="text-sm text-theme-muted">
              {d.addNewTopic || "Add a new topic"}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

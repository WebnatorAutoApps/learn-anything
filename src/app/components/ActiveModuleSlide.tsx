"use client";

import { useRouter } from "next/navigation";
import type { UpcomingProject } from "@/lib/hooks";
import { formatDate, getDueStatus } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export default function ActiveModuleSlide({
  project,
  onComplete,
}: {
  project: UpcomingProject;
  onComplete: (project: UpcomingProject) => void;
}) {
  const { t } = useI18n();
  const d = t.dashboard as Record<string, string>;
  const u = t.upcoming as Record<string, string>;
  const c = t.common as Record<string, string>;
  const cr = t.course as Record<string, string>;
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
            {c.step || "Step"} {project.moduleIndex} / {project.totalModules}
          </span>
        </div>

        {/* Module info */}
        <div className="mb-3">
          <h4 className="text-base font-semibold text-theme-primary mb-1">
            {project.moduleName}
          </h4>
          <div className="flex items-center gap-2 text-xs text-theme-muted">
            <span>{c.project || "Project"} {project.projectIndex}: {project.title}</span>
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
                {dueStatus === "overdue" ? (u.overdue || "Overdue —") + " " : (u.due || "Due") + " "}
                {formatDate(project.dueDate)}
              </span>
            ) : (
              <span className="text-xs text-theme-primary-faint italic">{u.noDueDate || "No due date"}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/course/${project.courseId}`)}
              className="px-3 py-1.5 text-xs rounded border border-theme-border text-theme-primary hover:bg-theme-surface-hover transition-colors"
            >
              {cr.view || "View"}
            </button>
            <button
              onClick={() => onComplete(project)}
              className="px-3 py-1.5 text-xs rounded bg-theme-accent text-theme-text-on-accent font-semibold hover:bg-theme-primary-hover transition-colors flex items-center gap-1.5"
              aria-label={d.markComplete}
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
              {cr.complete || "Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

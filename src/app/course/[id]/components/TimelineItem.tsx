"use client";

import type { Module } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import ProjectSelectionArea from "./ProjectSelectionArea";

interface TimelineItemProps {
  mod: Module;
  courseId: string;
  variant: "upcoming" | "completed";
  isExpanded: boolean;
  onToggle: () => void;
}

export default function TimelineItem({
  mod,
  courseId,
  variant,
  isExpanded,
  onToggle,
}: TimelineItemProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;

  const schedule = mod.schedule;
  const status = schedule?.status ?? null;
  const isLocked = status === "LOCKED" || status === "NEXT_PREVIEW";
  const isNextPreview = status === "NEXT_PREVIEW";
  const isCompleted = variant === "completed";

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-colors ${
        isCompleted
          ? "border-theme-border bg-theme-surface opacity-70"
          : isNextPreview
            ? "border-yellow-900/40 bg-theme-surface"
            : isLocked
              ? "border-theme-border bg-theme-surface opacity-50"
              : "border-theme-border bg-theme-surface"
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-full p-4 text-left flex items-center gap-3 transition-colors ${
          !isLocked && !isCompleted
            ? "hover:bg-theme-surface-hover cursor-pointer"
            : isCompleted
              ? "hover:bg-theme-surface-hover cursor-pointer"
              : "cursor-default"
        }`}
        disabled={isLocked}
      >
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border text-sm font-bold ${
            isCompleted
              ? "border-theme-border bg-theme-surface-hover text-theme-secondary"
              : isNextPreview
                ? "border-yellow-800/50 bg-yellow-950/30 text-yellow-600"
                : isLocked
                  ? "border-theme-border bg-theme-surface text-theme-primary-faint"
                  : "border-theme-border bg-theme-surface text-theme-primary"
          }`}
        >
          {isCompleted ? (
            <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : isLocked ? (
            <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          ) : (
            mod.module_index
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {isCompleted && (
              <span className="text-xs font-mono text-theme-muted border border-theme-border rounded px-1.5 py-0.5">
                {cr.done || "DONE"}
              </span>
            )}
            {isNextPreview && (
              <span className="text-xs font-mono text-yellow-600 border border-yellow-800/40 rounded px-1.5 py-0.5 bg-yellow-950/30">
                {cr.upNext || "UP NEXT"}
              </span>
            )}
            {status === "LOCKED" && !isNextPreview && (
              <span className="text-xs font-mono text-theme-primary-faint border border-theme-border rounded px-1.5 py-0.5">
                {cr.locked || "LOCKED"}
              </span>
            )}
            {schedule && (
              <span className="text-xs text-theme-muted">
                {isCompleted && mod.selectedProject?.completedAt
                  ? `Completed ${formatDate(mod.selectedProject.completedAt.slice(0, 10))}`
                  : status === "CURRENT"
                    ? `Due ${formatDate(schedule.dueDate)}`
                    : `Unlocks ${formatDate(schedule.unlockDate)}`}
              </span>
            )}
          </div>
          <h4 className={`font-semibold text-sm ${isCompleted ? "text-theme-secondary" : isLocked ? "text-theme-muted" : "text-theme-primary"}`}>
            {mod.title}
          </h4>
        </div>

        {!isLocked && (
          <svg
            className={`h-4 w-4 text-theme-secondary flex-shrink-0 transition-transform ${
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

      {!isLocked && isExpanded && mod.projects.length > 0 && (
        <div className="border-t border-theme-border px-4 py-3">
          <p className="text-xs text-theme-muted uppercase tracking-wider mb-3">
            Projects
          </p>
          <ProjectSelectionArea mod={mod} courseId={courseId} />
        </div>
      )}
    </div>
  );
}

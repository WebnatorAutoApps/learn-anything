"use client";

import { useState } from "react";
import type { Module } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import ProjectSelectionArea from "./ProjectSelectionArea";

interface HeroProjectCardProps {
  mod: Module;
  courseId: string;
  isLastCompleted: boolean;
  nextModule: Module | null;
}

export default function HeroProjectCard({
  mod,
  courseId,
  isLastCompleted,
  nextModule,
}: HeroProjectCardProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;
  const c = t.common as Record<string, string>;

  const [expanded, setExpanded] = useState(true);
  const selection = mod.selectedProject;
  const isCompleted = selection?.completed ?? false;
  const hasSelection = !!selection;

  const projectStatus = isCompleted
    ? (cr.completed || "COMPLETED")
    : hasSelection
      ? (cr.inProgress || "IN PROGRESS")
      : (cr.readyToStart || "READY TO START");

  const statusColors = isCompleted
    ? "text-theme-secondary border-theme-border-strong bg-theme-surface-hover"
    : hasSelection
      ? "text-yellow-500 border-yellow-700/40 bg-yellow-950/20"
      : "text-blue-400 border-blue-700/40 bg-blue-950/20";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-theme-primary bg-theme-surface overflow-hidden shadow-lg shadow-[color:var(--t-glow)]">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full p-5 text-left flex items-start gap-4 hover:bg-theme-surface-hover transition-colors"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-theme-primary bg-theme-surface-hover text-lg font-bold text-theme-primary">
            {mod.module_index}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-wide">
                {cr.currentFocus || "Current Focus"}
              </span>
              <span className={`text-xs font-mono border rounded px-1.5 py-0.5 ${statusColors}`}>
                {projectStatus}
              </span>
              {mod.schedule && (
                <span className="text-xs text-theme-muted">
                  Due {formatDate(mod.schedule.dueDate)}
                </span>
              )}
            </div>
            <h4 className="font-semibold text-theme-primary text-lg">
              {c.step || "Step"} {mod.module_index}: {mod.title}
            </h4>
            <p className="text-sm text-theme-muted mt-1">
              {mod.description}
            </p>
          </div>
          <svg
            className={`h-5 w-5 text-theme-secondary flex-shrink-0 mt-3 transition-transform ${
              expanded ? "rotate-180" : ""
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

        {expanded && mod.projects.length > 0 && (
          <div className="border-t border-theme-primary px-5 py-4">
            <p className="text-xs text-theme-muted uppercase tracking-wider mb-3">
              Projects
            </p>
            <ProjectSelectionArea mod={mod} courseId={courseId} />
          </div>
        )}
      </div>

      {/* CTA to move to next step when current is completed */}
      {isLastCompleted && isCompleted && nextModule && (
        <div className="rounded-lg border border-theme-primary bg-theme-surface p-4 flex items-center justify-between">
          <div>
            <p className="text-theme-primary font-medium text-sm">
              {cr.readyForNext || "Ready for the next step?"}
            </p>
            <p className="text-theme-muted text-xs mt-0.5">
              {c.step || "Step"} {nextModule.module_index}: {nextModule.title}
            </p>
          </div>
          <span className="text-xs text-theme-muted font-mono border border-theme-border rounded px-2 py-1">
            {nextModule.schedule?.status === "CURRENT"
              ? (cr.unlocked || "UNLOCKED")
              : nextModule.schedule?.status === "NEXT_PREVIEW"
                ? `Unlocks ${formatDate(nextModule.schedule.unlockDate)}`
                : (cr.locked || "LOCKED")}
          </span>
        </div>
      )}
    </div>
  );
}

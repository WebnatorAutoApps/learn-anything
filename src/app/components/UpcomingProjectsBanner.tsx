"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useUpcomingProjects,
  useCompleteProject,
} from "@/lib/hooks/queries";
import type { UpcomingProject } from "@/lib/hooks/queries";

const INITIAL_VISIBLE = 5;
const PAGE_SIZE = 5;

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
  // "soon" if due within 2 days
  const soon = new Date();
  soon.setDate(soon.getDate() + 2);
  const soonStr = soon.toISOString().slice(0, 10);
  if (dueDate <= soonStr) return "soon";
  return "normal";
}

function ProjectRow({
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
    <div className="flex items-center gap-3 rounded-lg border border-green-900/40 bg-green-950/20 px-4 py-3 transition-colors hover:bg-green-950/40 hover:border-green-700/50 group">
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onComplete(project);
        }}
        disabled={isCompleting}
        className="flex-shrink-0 h-5 w-5 rounded border border-green-700/60 bg-green-950/50 hover:border-green-500 hover:bg-green-900/30 transition-colors disabled:opacity-50 flex items-center justify-center"
        aria-label={`Mark "${project.title}" as complete`}
      >
        {isCompleting && (
          <svg
            className="animate-spin h-3 w-3 text-green-400"
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
        )}
      </button>

      {/* Clickable project info */}
      <button
        onClick={() => router.push(`/course/${project.courseId}`)}
        className="flex-1 min-w-0 text-left"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-green-400 truncate">
            {project.title}
          </span>
          <span className="text-xs text-green-700">
            {project.courseName}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-green-800">
            Step {project.moduleIndex} &middot; Project {project.projectIndex}
          </span>
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
      </button>

      {/* Arrow icon */}
      <svg
        className="h-4 w-4 text-green-800 group-hover:text-green-500 flex-shrink-0 transition-colors"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

export default function UpcomingProjectsBanner() {
  const { data: projects, isLoading } = useUpcomingProjects();
  const completeMutation = useCompleteProject();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [completingId, setCompletingId] = useState<string | null>(null);

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

  // Don't render anything while loading or if there are no projects
  if (isLoading || !projects || projects.length === 0) {
    return null;
  }

  const visibleProjects = projects.slice(0, visibleCount);
  const hasMore = projects.length > visibleCount;

  return (
    <div className="mb-8 rounded-lg border border-green-900/60 bg-green-950/30 p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="h-5 w-5 text-green-500"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-semibold text-green-400 tracking-wide">
          Upcoming Projects
        </h3>
        <span className="text-xs text-green-700 ml-1">
          ({projects.length} remaining)
        </span>
      </div>

      <div className="space-y-2">
        {visibleProjects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onComplete={handleComplete}
            isCompleting={completingId === project.id}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-3 w-full py-2 text-sm text-green-600 hover:text-green-400 transition-colors border border-green-900/40 rounded-lg hover:bg-green-950/30"
        >
          Show more ({projects.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}

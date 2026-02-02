"use client";

import {
  useSelectProject,
  type Module,
  type Project,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import ProjectCompletionForm from "./ProjectCompletionForm";

interface ProjectSelectionAreaProps {
  mod: Module;
  courseId: string;
}

export default function ProjectSelectionArea({ mod, courseId }: ProjectSelectionAreaProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;

  const selectMutation = useSelectProject();

  const selection = mod.selectedProject;
  const hasSelection = !!selection;
  const selectedProjectId = selection?.projectId ?? null;
  const isCompleted = selection?.completed ?? false;

  async function handleSelect(project: Project) {
    await selectMutation.mutateAsync({
      courseId,
      moduleId: mod.id,
      projectId: project.id,
    });
  }

  if (mod.projects.length === 0) {
    return (
      <p className="text-sm text-theme-muted italic">
        {cr.noProjects || "No projects available for this step."}
      </p>
    );
  }

  if (!hasSelection) {
    return (
      <div className="space-y-3">
        <div className="rounded border border-yellow-800/40 bg-yellow-950/20 px-4 py-3">
          <p className="text-sm text-yellow-600 font-medium">
            <span className="text-yellow-700 mr-1">{"> "}</span>
            {cr.chooseProject || "Choose a project to work on"}
          </p>
        </div>
        {mod.projects.map((project) => (
          <div
            key={project.id}
            className="rounded border border-theme-border bg-theme-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-theme-muted border border-theme-border rounded px-1.5 py-0.5">
                    {cr.option || "Option"} {project.project_index}
                  </span>
                  <h5 className="font-semibold text-theme-primary text-sm">
                    {project.title}
                  </h5>
                </div>
                <p className="text-sm text-theme-secondary leading-relaxed">
                  {project.objective}
                </p>
              </div>
              <button
                onClick={() => handleSelect(project)}
                disabled={selectMutation.isPending}
                className="flex-shrink-0 px-3 py-1.5 rounded border border-theme-primary bg-theme-surface-hover text-theme-primary text-xs font-medium hover:bg-theme-surface-hover hover:border-theme-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectMutation.isPending ? "..." : (cr.select || "Select")}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const selectedProject = mod.projects.find(
    (p) => p.id === selectedProjectId
  );

  return (
    <div className="space-y-3">
      {selectedProject && (
        <div
          className={`rounded border-2 p-4 ${
            isCompleted
              ? "border-theme-border-strong bg-theme-surface"
              : "border-theme-primary bg-theme-surface"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-theme-primary border border-theme-primary rounded px-1.5 py-0.5 bg-theme-surface-hover">
              {isCompleted ? (cr.completed || "COMPLETED") : (cr.selected || "SELECTED")}
            </span>
            <h5 className="font-semibold text-theme-primary text-sm">
              {selectedProject.title}
            </h5>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">
                {cr.objective || "Objective"}
              </p>
              <p className="text-sm text-theme-secondary leading-relaxed">
                {selectedProject.objective}
              </p>
            </div>
            <div>
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">
                {cr.instructions || "Instructions"}
              </p>
              <p className="text-sm text-theme-muted leading-relaxed">
                {selectedProject.instructions}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <ProjectCompletionForm mod={mod} courseId={courseId} />
          </div>
        </div>
      )}

      {mod.projects
        .filter((p) => p.id !== selectedProjectId)
        .map((project) => (
          <div
            key={project.id}
            className="rounded border border-theme-border bg-theme-surface p-4 opacity-40"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-theme-primary-faint border border-theme-border rounded px-1.5 py-0.5">
                {cr.option || "Option"} {project.project_index}
              </span>
              <h5 className="font-semibold text-theme-muted text-sm">
                {project.title}
              </h5>
            </div>
            <p className="text-sm text-theme-primary-faint leading-relaxed">
              {project.objective}
            </p>
          </div>
        ))}
    </div>
  );
}

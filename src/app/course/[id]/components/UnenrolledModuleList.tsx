"use client";

import type { Module } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

interface UnenrolledModuleListProps {
  modules: Module[];
}

export default function UnenrolledModuleList({ modules }: UnenrolledModuleListProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;

  if (modules.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-theme-primary mb-4 tracking-wide">
        <span className="text-theme-secondary">{">"}</span>{" "}
        {cr.learningPathSteps || "Learning Path Steps"}
        <span className="text-sm font-normal text-theme-muted ml-2">
          ({modules.length} step
          {modules.length !== 1 ? "s" : ""})
        </span>
      </h3>

      <div className="space-y-2">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="rounded-lg border border-theme-border bg-theme-surface"
          >
            <div className="p-4 flex items-start gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-theme-border bg-theme-surface text-sm font-bold text-theme-primary">
                {mod.module_index}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-theme-primary">
                  {mod.title}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-theme-muted mt-4 text-center">
        {cr.enrollToUnlock || "Enroll to unlock step details and project options."}
      </p>
    </div>
  );
}

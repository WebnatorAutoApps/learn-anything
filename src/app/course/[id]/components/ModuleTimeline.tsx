"use client";

import type { Module, ModuleSchedule } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import TimelineItem from "./TimelineItem";

interface ModuleTimelineProps {
  modules: Module[];
  currentModuleId: string | null;
  courseId: string;
  expandedModules: Set<number>;
  toggleModule: (moduleIndex: number, schedule: ModuleSchedule | null) => void;
}

export default function ModuleTimeline({
  modules,
  currentModuleId,
  courseId,
  expandedModules,
  toggleModule,
}: ModuleTimelineProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;

  const completedModules = modules.filter(
    (m) => m.selectedProject?.completed && m.id !== currentModuleId
  );
  const upcomingModules = modules.filter(
    (m) => !m.selectedProject?.completed && m.id !== currentModuleId
  );

  return (
    <div className="space-y-6">
      {/* Upcoming Steps */}
      {upcomingModules.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-theme-primary mb-3 tracking-wide uppercase">
            {cr.upcomingSteps || "Upcoming Steps"}
            <span className="text-theme-muted font-normal ml-2">
              ({upcomingModules.length})
            </span>
          </h3>
          <div className="space-y-2">
            {upcomingModules.map((mod) => (
              <TimelineItem
                key={mod.id}
                mod={mod}
                courseId={courseId}
                variant="upcoming"
                isExpanded={expandedModules.has(mod.module_index)}
                onToggle={() => toggleModule(mod.module_index, mod.schedule)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Steps */}
      {completedModules.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-theme-primary mb-3 tracking-wide uppercase">
            {cr.completedSteps || "Completed Steps"}
            <span className="text-theme-muted font-normal ml-2">
              ({completedModules.length})
            </span>
          </h3>
          <div className="space-y-2">
            {completedModules.map((mod) => (
              <TimelineItem
                key={mod.id}
                mod={mod}
                courseId={courseId}
                variant="completed"
                isExpanded={expandedModules.has(mod.module_index)}
                onToggle={() => toggleModule(mod.module_index, mod.schedule)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

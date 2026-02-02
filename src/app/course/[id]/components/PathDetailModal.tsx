"use client";

import { useI18n } from "@/lib/i18n";

interface PathDetailModalProps {
  course: {
    normalized_title: string;
    learning_goal: string;
    learning_goal_details: string;
    expertise_level: string;
    expertise_details: string | null;
    expected_skill_level: string;
    likelihood_of_learning: number;
    total_modules: number;
    commitment_interval_days: number | null;
  };
  onClose: () => void;
}

export default function PathDetailModal({ course, onClose }: PathDetailModalProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;
  const c = t.common as Record<string, string>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 max-h-[85vh] rounded-lg border border-theme-border bg-theme-surface shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-theme-border">
          <h3 className="text-lg font-semibold text-theme-primary tracking-wide">
            {cr.pathDetails || "Path Details"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover rounded transition-colors"
            aria-label={c.close || "Close"}
          >
            <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          <div>
            <h4 className="text-xl font-semibold text-theme-primary mb-2">
              {course.normalized_title}
            </h4>
            <p className="text-theme-secondary leading-relaxed">
              {course.learning_goal}
            </p>
          </div>

          <div>
            <p className="text-xs text-theme-muted uppercase tracking-wider mb-1.5">
              {cr.aboutThisPath || "About This Path"}
            </p>
            <p className="text-theme-muted text-sm leading-relaxed">
              {course.learning_goal_details}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded border border-theme-border bg-theme-surface p-3">
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">
                {cr.stepsLabel || "Steps"}
              </p>
              <p className="text-lg font-bold text-theme-primary">
                {course.total_modules}
              </p>
            </div>
            <div className="rounded border border-theme-border bg-theme-surface p-3">
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">
                {cr.successRate || "Success Rate"}
              </p>
              <p className="text-lg font-bold text-theme-primary">
                {course.likelihood_of_learning}%
              </p>
            </div>
            <div className="rounded border border-theme-border bg-theme-surface p-3">
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">
                {cr.yourLevel || "Your Level"}
              </p>
              <p className="text-sm font-semibold text-theme-primary">
                {course.expertise_level}
              </p>
            </div>
            <div className="rounded border border-theme-border bg-theme-surface p-3">
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">
                {cr.targetLevel || "Target Level"}
              </p>
              <p className="text-sm font-semibold text-theme-primary">
                {course.expected_skill_level}
              </p>
            </div>
          </div>

          {course.expertise_details && (
            <div>
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1.5">
                {cr.yourBackground || "Your Background"}
              </p>
              <p className="text-theme-secondary text-sm leading-relaxed">
                {course.expertise_details}
              </p>
            </div>
          )}

          {course.commitment_interval_days && (
            <div>
              <p className="text-xs text-theme-muted uppercase tracking-wider mb-1.5">
                {cr.studyCadence || "Study Cadence"}
              </p>
              <p className="text-theme-secondary text-sm">
                Every {course.commitment_interval_days} day
                {course.commitment_interval_days !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

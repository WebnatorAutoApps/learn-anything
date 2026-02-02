"use client";

import { useI18n } from "@/lib/i18n";

interface CompletionCelebrationProps {
  pathTitle: string;
}

export default function CompletionCelebration({ pathTitle }: CompletionCelebrationProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;

  return (
    <div className="rounded-lg border-2 border-theme-primary bg-theme-surface p-8 text-center">
      <div className="text-5xl mb-4">*</div>
      <h3 className="text-2xl font-bold text-theme-primary mb-2">
        {cr.pathComplete || "Path Complete!"}
      </h3>
      <p className="text-theme-secondary mb-1">
        {cr.completedEveryStep || "You've completed every step in"}
      </p>
      <p className="text-theme-primary font-semibold text-lg mb-4">
        {pathTitle}
      </p>
      <p className="text-theme-muted text-sm leading-relaxed max-w-md mx-auto">
        {cr.completionMessage || "Every step you took brought you closer to mastery. The skills you've built are yours to keep. Well done."}
      </p>
    </div>
  );
}

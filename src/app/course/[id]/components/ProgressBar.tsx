"use client";

import { useI18n } from "@/lib/i18n";

export function getMotivationalMessage(percent: number, completedCount: number): string {
  if (completedCount === 0) return "Your journey begins now. Take the first step!";
  if (percent === 100) return ""; // handled by CompletionCelebration
  if (percent >= 75) return "Almost there! The finish line is in sight.";
  if (percent >= 50) return "Halfway there! Keep the momentum going.";
  if (percent >= 25) return "Great progress! You're building real skills.";
  if (completedCount === 1) return "First step done! You're on your way.";
  return "Keep going! Every step counts.";
}

interface ProgressBarProps {
  completedCount: number;
  totalCount: number;
}

export default function ProgressBar({ completedCount, totalCount }: ProgressBarProps) {
  const { t } = useI18n();
  const p = t.progress as Record<string, string>;

  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const message = getMotivationalMessage(percent, completedCount);

  const translatedMessage = message
    ? (completedCount === 0 ? (p.journeyBegins || message)
      : percent >= 75 ? (p.almostThere || message)
      : percent >= 50 ? (p.halfway || message)
      : percent >= 25 ? (p.greatProgress || message)
      : completedCount === 1 ? (p.firstStep || message)
      : (p.keepGoing || message))
    : "";

  return (
    <div className="rounded-lg border border-theme-border bg-theme-surface p-5">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-2xl font-bold text-theme-primary">
            {percent}%
          </p>
          <p className="text-sm text-theme-muted">
            {completedCount} of {totalCount} step{totalCount !== 1 ? "s" : ""} completed
          </p>
        </div>
        {translatedMessage && (
          <p className="text-sm text-theme-secondary italic text-right max-w-[50%]">
            {translatedMessage}
          </p>
        )}
      </div>
      <div className="h-3 rounded-full bg-theme-surface border border-theme-border overflow-hidden">
        <div
          className="h-full rounded-full bg-theme-secondary transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

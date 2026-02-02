import { type KeyboardEvent, type RefObject } from "react";
import { useI18n } from "@/lib/i18n";
import type { StepKey, ExpertiseLevel, CommitmentFrequency } from "../types";
import {
  EXPERTISE_LEVELS,
  COMMITMENT_FREQUENCIES,
  TIME_MONTHS,
} from "../constants";

interface StepInputProps {
  step: StepKey;
  inputValue: string;
  inputRef: RefObject<HTMLInputElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onTextSubmit: () => void;
  onExpertiseSelect: (level: ExpertiseLevel) => void;
  onCommitmentSelect: (freq: CommitmentFrequency) => void;
  onDurationSelect: (months: number) => void;
}

function ArrowIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function StepInput({
  step,
  inputValue,
  inputRef,
  textareaRef,
  onInputChange,
  onTextSubmit,
  onExpertiseSelect,
  onCommitmentSelect,
  onDurationSelect,
}: StepInputProps) {
  const { t } = useI18n();
  const l = t.learn as Record<string, string>;

  const expertiseLabels: Record<string, string> = {
    "No clue": l.expertiseNoClue,
    "Beginner": l.expertiseBeginner,
    "Intermediate": l.expertiseIntermediate,
    "Advanced": l.expertiseAdvanced,
    "Expert": l.expertiseExpert,
  };

  const commitmentLabels: Record<string, string> = {
    "Daily": l.commitDaily,
    "Every 3 days": l.commitEvery3Days,
    "Weekly": l.commitWeekly,
    "Bi-weekly": l.commitBiWeekly,
    "Monthly": l.commitMonthly,
  };

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onTextSubmit();
    }
  }

  switch (step) {
    case "topic":
      return (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={l.topicPlaceholder}
            className="flex-1 rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-primary placeholder-theme-primary-faint focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary transition-colors"
          />
          <button
            type="button"
            onClick={onTextSubmit}
            disabled={!inputValue.trim()}
            className="px-4 py-2 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold hover:bg-theme-primary-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowIcon />
          </button>
        </div>
      );

    case "details":
      return (
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={l.detailsPlaceholder}
            rows={2}
            className="flex-1 rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-primary placeholder-theme-primary-faint focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary transition-colors resize-none"
          />
          <button
            type="button"
            onClick={onTextSubmit}
            disabled={!inputValue.trim()}
            className="self-end px-4 py-2 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold hover:bg-theme-primary-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowIcon />
          </button>
        </div>
      );

    case "expertise":
      return (
        <div className="flex flex-wrap gap-2">
          {EXPERTISE_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onExpertiseSelect(level)}
              className="px-4 py-2 rounded-lg border border-theme-border text-theme-primary hover:bg-theme-surface-hover hover:border-theme-primary transition-colors"
            >
              {expertiseLabels[level] || level}
            </button>
          ))}
        </div>
      );

    case "expertiseDetails":
      return (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={l.expertiseDetailPlaceholder}
            className="flex-1 rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-primary placeholder-theme-primary-faint focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary transition-colors"
          />
          <button
            type="button"
            onClick={onTextSubmit}
            className="px-4 py-2 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold hover:bg-theme-primary-hover transition-colors"
          >
            {inputValue.trim() ? <ArrowIcon /> : l.skip}
          </button>
        </div>
      );

    case "commitment":
      return (
        <div className="flex flex-wrap gap-2">
          {COMMITMENT_FREQUENCIES.map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => onCommitmentSelect(freq)}
              className="px-4 py-2 rounded-lg border border-theme-border text-theme-primary hover:bg-theme-surface-hover hover:border-theme-primary transition-colors"
            >
              {commitmentLabels[freq] || freq}
            </button>
          ))}
        </div>
      );

    case "duration":
      return (
        <div className="flex flex-wrap gap-2">
          {TIME_MONTHS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onDurationSelect(m)}
              className="px-3 py-2 rounded-lg border border-theme-border text-theme-primary hover:bg-theme-surface-hover hover:border-theme-primary transition-colors min-w-[4rem]"
            >
              {m} {l.mo}
            </button>
          ))}
        </div>
      );

    default:
      return null;
  }
}

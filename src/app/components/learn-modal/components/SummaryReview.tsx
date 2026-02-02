import { useI18n } from "@/lib/i18n";
import type { StepKey } from "../types";

interface SummaryItem {
  label: string;
  value: string;
  targetStep: StepKey;
}

interface SummaryReviewProps {
  items: SummaryItem[];
  onEditStep: (step: StepKey) => void;
  onBegin: () => void;
}

export default function SummaryReview({
  items,
  onEditStep,
  onBegin,
}: SummaryReviewProps) {
  const { t } = useI18n();
  const l = t.learn as Record<string, string>;

  return (
    <div className="chat-message flex flex-col gap-4 pt-4">
      <p className="text-theme-secondary text-sm text-center">
        {l.summaryInstruction}
      </p>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.targetStep}
            type="button"
            onClick={() => onEditStep(item.targetStep)}
            className="w-full text-left rounded border border-theme-border bg-theme-surface-hover px-4 py-2.5 hover:bg-theme-surface-hover hover:border-theme-primary transition-colors group"
          >
            <span className="text-theme-muted text-xs uppercase tracking-wider font-semibold">
              {item.label}
            </span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-theme-primary text-sm">{item.value}</span>
              <svg
                className="h-4 w-4 text-theme-muted group-hover:text-theme-primary transition-colors shrink-0 ml-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onBegin}
          className="px-8 py-3 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold text-lg hover:bg-theme-primary-hover transition-colors shadow-lg shadow-[color:var(--t-glow)]"
        >
          {l.begin}
        </button>
      </div>
    </div>
  );
}

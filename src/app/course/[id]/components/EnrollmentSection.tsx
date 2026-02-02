"use client";

import Spinner from "@/app/components/ui/Spinner";
import { useI18n } from "@/lib/i18n";
import { CADENCE_OPTIONS } from "@/lib/constants/enrollment";
import { validateCommitment } from "@/lib/schedule";

interface EnrollmentSectionProps {
  totalModules: number;
  commitmentIntervalDays: number;
  setCommitmentIntervalDays: (value: number) => void;
  enrollError: string | null;
  setEnrollError: (value: string | null) => void;
  onEnroll: () => void;
  isEnrolling: boolean;
  commitmentValidation: ReturnType<typeof validateCommitment> | null;
}

export default function EnrollmentSection({
  totalModules,
  commitmentIntervalDays,
  setCommitmentIntervalDays,
  enrollError,
  setEnrollError,
  onEnroll,
  isEnrolling,
  commitmentValidation,
}: EnrollmentSectionProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;

  const cadenceLabels: Record<number, string> = {
    1: cr.cadenceDaily,
    2: cr.cadenceEvery2Days,
    3: cr.cadenceEvery3Days,
    5: cr.cadenceEvery5Days,
    7: cr.cadenceWeekly,
    14: cr.cadenceBiweekly,
    30: cr.cadenceMonthly,
  };

  return (
    <div className="mb-8">
      <div className="space-y-4">
        {/* Cadence Selector */}
        <div className="rounded-lg border border-theme-border bg-theme-surface p-4">
          <label className="block text-xs text-theme-muted uppercase tracking-wider mb-3">
            {cr.howOften}
          </label>
          <div className="flex flex-wrap gap-2">
            {CADENCE_OPTIONS.map((opt) => {
              const optValidation = validateCommitment(
                totalModules,
                opt.value
              );
              const isSelected = commitmentIntervalDays === opt.value;
              const isTooLong = !optValidation.valid;

              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setCommitmentIntervalDays(opt.value);
                    setEnrollError(null);
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    isSelected
                      ? isTooLong
                        ? "border-red-500/60 bg-red-950/40 text-red-400"
                        : "border-theme-primary bg-theme-surface-hover text-theme-primary"
                      : isTooLong
                        ? "border-red-900/40 bg-red-950/20 text-red-700 hover:bg-red-950/30 hover:text-red-500"
                        : "border-theme-border bg-theme-surface text-theme-muted hover:bg-theme-surface-hover hover:text-theme-secondary"
                  }`}
                >
                  {cadenceLabels[opt.value] || opt.label}
                </button>
              );
            })}
          </div>

          {/* Duration projection */}
          {commitmentValidation && (
            <div className="mt-3">
              {commitmentValidation.valid ? (
                <p className="text-xs text-theme-muted">
                  {cr.estimatedCompletion
                    .replace("{days}", String(commitmentValidation.projectedDays))
                    .replace("{steps}", String(totalModules))}
                </p>
              ) : commitmentValidation.suggestedIntervalDays !== null ? (
                <div className="rounded border border-red-900/40 bg-red-950/20 px-3 py-2.5 mt-1">
                  <p className="text-sm text-red-400 font-medium mb-1">
                    {cr.paceTooSlow.replace("{years}", String(commitmentValidation.projectedYears))}
                  </p>
                  <p className="text-xs text-red-500/80 leading-relaxed">
                    {cr.paceWarning.replace("{days}", String(commitmentValidation.suggestedIntervalDays))}
                  </p>
                </div>
              ) : (
                <div className="rounded border border-red-900/40 bg-red-950/20 px-3 py-2.5 mt-1">
                  <p className="text-sm text-red-400 font-medium mb-1">
                    {cr.tooManySteps}
                  </p>
                  <p className="text-xs text-red-500/80 leading-relaxed">
                    {cr.tooManyStepsDetail
                      .replace("{n}", String(totalModules))
                      .replace("{years}", String(commitmentValidation.projectedYears))}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enroll error */}
        {enrollError && (
          <p className="text-red-400 text-sm px-3 py-2 rounded border border-red-900/40 bg-red-950/30">
            {enrollError}
          </p>
        )}

        <button
          onClick={onEnroll}
          disabled={
            isEnrolling ||
            (commitmentValidation !== null && !commitmentValidation.valid)
          }
          className="w-full py-3 px-6 rounded-lg border border-theme-primary bg-theme-surface-hover text-theme-primary font-semibold tracking-wider hover:bg-theme-surface-hover hover:border-theme-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEnrolling ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              {cr.enrolling}
            </span>
          ) : (
            `${cr.startNow} — ${cadenceLabels[commitmentIntervalDays] || CADENCE_OPTIONS.find((o) => o.value === commitmentIntervalDays)?.label || ""}`
          )}
        </button>
      </div>
    </div>
  );
}

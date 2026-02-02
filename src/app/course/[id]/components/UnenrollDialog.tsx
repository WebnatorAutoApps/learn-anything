"use client";

import Spinner from "@/app/components/ui/Spinner";
import { useI18n } from "@/lib/i18n";

interface UnenrollDialogProps {
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function UnenrollDialog({
  isPending,
  error,
  onConfirm,
  onCancel,
}: UnenrollDialogProps) {
  const { t } = useI18n();
  const cr = t.course as Record<string, string>;
  const c = t.common as Record<string, string>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (!isPending) {
            onCancel();
          }
        }}
      />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-lg border border-theme-border bg-theme-surface p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-theme-primary mb-2">
          {cr.unenrollTitle || "Already leaving?"}
        </h3>
        <p className="text-theme-secondary text-sm leading-relaxed mb-6">
          {cr.unenrollMessage || "You've been doing so well! Are you sure you want to unenroll from this learning path? Your progress and schedule won't be saved."}
        </p>

        {error && (
          <p className="text-red-400 text-sm mb-4 px-3 py-2 rounded border border-red-900/40 bg-red-950/30">
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-theme-border text-theme-primary hover:bg-theme-surface-hover transition-colors text-sm font-medium disabled:opacity-50"
          >
            {c.cancel || "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-red-900/60 bg-red-950/30 text-red-400 hover:bg-red-900/40 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner />
                {cr.unenrolling || "Unenrolling..."}
              </span>
            ) : (
              (cr.unenroll || "Unenroll")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

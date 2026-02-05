/**
 * Module scheduling utilities.
 *
 * All date calculations use UTC date strings (YYYY-MM-DD) to avoid
 * timezone discrepancies between server and client.
 */

import { ERROR_MESSAGES } from "./constants/errors";

export const MAX_ENROLLMENT_DAYS = 365;

export type ModuleStatus = "CURRENT" | "NEXT_PREVIEW" | "LOCKED";

export interface ModuleScheduleEntry {
  moduleId: string;
  moduleIndex: number;
  unlockDate: string; // YYYY-MM-DD (UTC)
  dueDate: string; // YYYY-MM-DD (UTC)
}

export interface ModuleStatusEntry {
  moduleId: string;
  moduleIndex: number;
  unlockDate: string;
  dueDate: string;
  status: ModuleStatus;
}

/**
 * Adds `days` to a UTC date string and returns a new YYYY-MM-DD string.
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Returns today's date as a YYYY-MM-DD UTC string.
 */
export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Generate a schedule for all modules in a course.
 *
 * Each module's unlock date is `enrollmentDate + (index * intervalDays)`.
 * The due date is `unlockDate + intervalDays - 1` (so the learner has
 * `intervalDays` calendar days from unlock to due, inclusive of unlock day).
 *
 * @param modules - Array of `{ id, module_index }` sorted by module_index ascending
 * @param enrollmentDate - YYYY-MM-DD UTC date string
 * @param intervalDays - number of days between each module unlock
 */
export function generateModuleSchedule(
  modules: Array<{ id: string; module_index: number }>,
  enrollmentDate: string,
  intervalDays: number
): ModuleScheduleEntry[] {
  if (modules.length === 0) return [];
  if (intervalDays < 1) {
    throw new Error(ERROR_MESSAGES.INTERVAL_DAYS_MIN);
  }

  return modules.map((mod, idx) => {
    const unlockDate = addDays(enrollmentDate, idx * intervalDays);
    const dueDate = addDays(unlockDate, intervalDays - 1);
    return {
      moduleId: mod.id,
      moduleIndex: mod.module_index,
      unlockDate,
      dueDate,
    };
  });
}

/**
 * Calculate the total number of days a course will take to complete
 * based on the number of steps and the interval between each step.
 *
 * The last module unlocks on day `(stepCount - 1) * intervalDays` and
 * the due date is `intervalDays - 1` days after that, so total span is
 * `(stepCount - 1) * intervalDays + intervalDays - 1` which simplifies
 * to `stepCount * intervalDays - 1`. We use `stepCount * intervalDays`
 * as the projected duration since it represents the full number of
 * calendar days the learner is committing to.
 */
export function calculateProjectedDays(
  stepCount: number,
  intervalDays: number
): number {
  if (stepCount <= 0) return 0;
  if (intervalDays < 1) return 0;
  return stepCount * intervalDays;
}

export interface CommitmentValidationResult {
  valid: boolean;
  projectedDays: number;
  projectedYears: number;
  suggestedIntervalDays: number | null;
}

/**
 * Validate whether a commitment interval will allow the learner to
 * complete the course within MAX_ENROLLMENT_DAYS (365 days).
 *
 * Returns a result object with:
 * - valid: whether the commitment fits within the max duration
 * - projectedDays: total projected days for completion
 * - projectedYears: projected duration in years (rounded to 1 decimal)
 * - suggestedIntervalDays: if invalid, the maximum interval that would
 *   fit within the limit; null if valid or if even daily commitment
 *   would exceed the limit
 */
export function validateCommitment(
  stepCount: number,
  intervalDays: number
): CommitmentValidationResult {
  const projectedDays = calculateProjectedDays(stepCount, intervalDays);
  const projectedYears = Math.round((projectedDays / 365) * 10) / 10;
  const valid = projectedDays <= MAX_ENROLLMENT_DAYS;

  let suggestedIntervalDays: number | null = null;
  if (!valid && stepCount > 0) {
    const maxInterval = Math.floor(MAX_ENROLLMENT_DAYS / stepCount);
    suggestedIntervalDays = maxInterval >= 1 ? maxInterval : null;
  }

  return { valid, projectedDays, projectedYears, suggestedIntervalDays };
}

/**
 * Resolve the access status of each module based on the current date
 * and its schedule.
 *
 * Rules:
 * - A module is "unlocked" if `today >= unlockDate`.
 * - Among all unlocked modules, the last one is `CURRENT`.
 * - The first locked module (immediately after CURRENT) is `NEXT_PREVIEW`.
 * - All other locked modules are `LOCKED`.
 * - If all modules are unlocked, the last one is `CURRENT` and there
 *   is no `NEXT_PREVIEW`.
 *
 * @param schedule - sorted by moduleIndex ascending
 * @param today - YYYY-MM-DD UTC date string (defaults to actual today)
 */
export function resolveModuleStatuses(
  schedule: ModuleScheduleEntry[],
  today?: string
): ModuleStatusEntry[] {
  if (schedule.length === 0) return [];

  const currentDate = today ?? todayUTC();

  // Find the index of the last unlocked module
  let lastUnlockedIdx = -1;
  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].unlockDate <= currentDate) {
      lastUnlockedIdx = i;
    }
  }

  // If nothing is unlocked yet (shouldn't happen if enrollment just happened,
  // since the first module unlocks on enrollment day), treat the first as CURRENT.
  if (lastUnlockedIdx === -1) {
    lastUnlockedIdx = 0;
  }

  return schedule.map((entry, idx) => {
    let status: ModuleStatus;
    if (idx <= lastUnlockedIdx) {
      // All unlocked modules up to and including the last one.
      // The last unlocked one is CURRENT; earlier ones are also accessible
      // (they remain unlocked), so we treat them as CURRENT too — the UI
      // can differentiate by checking if it's the latest.
      // Per the spec: "A module unlocks automatically once the previous
      // module's window has expired" — so all unlocked modules remain
      // accessible. We mark the latest unlocked as CURRENT.
      if (idx === lastUnlockedIdx) {
        status = "CURRENT";
      } else {
        // Past modules that are already unlocked — treat as CURRENT
        // (they remain accessible)
        status = "CURRENT";
      }
    } else if (idx === lastUnlockedIdx + 1) {
      status = "NEXT_PREVIEW";
    } else {
      status = "LOCKED";
    }

    return {
      moduleId: entry.moduleId,
      moduleIndex: entry.moduleIndex,
      unlockDate: entry.unlockDate,
      dueDate: entry.dueDate,
      status,
    };
  });
}

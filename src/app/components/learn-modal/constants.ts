import type { StepKey, CommitmentFrequency } from "./types";

export const TYPING_INDICATOR_DELAY_MS = 600;

export const EXPERTISE_LEVELS = [
  "No clue",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const;

export const COMMITMENT_FREQUENCIES = [
  "Daily",
  "Every 3 days",
  "Weekly",
  "Bi-weekly",
  "Monthly",
] as const;

export const TIME_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export const SESSIONS_PER_MONTH: Record<CommitmentFrequency, number> = {
  Daily: 30,
  "Every 3 days": 10,
  Weekly: 4,
  "Bi-weekly": 2,
  Monthly: 1,
};

export const QUESTIONS: Record<Exclude<StepKey, "done">, string> = {
  topic:
    "Hey! I'm here to help you start a new learning journey. What do you want to learn?",
  details:
    "Nice choice! Can you tell me a bit more about what you'd like to accomplish?",
  expertise: "Got it! How would you rate your current level?",
  expertiseDetails:
    "Want to share a bit more about your experience? (you can skip this one)",
  commitment: "How often can you dedicate time to this?",
  duration: "Last one — how long do you want to commit to this goal?",
};

export function calculateModules(
  commitment: CommitmentFrequency,
  durationMonths: number
): number {
  return SESSIONS_PER_MONTH[commitment] * durationMonths;
}

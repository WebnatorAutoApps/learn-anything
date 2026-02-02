import type { EXPERTISE_LEVELS, COMMITMENT_FREQUENCIES } from "./constants";

export type ExpertiseLevel = (typeof EXPERTISE_LEVELS)[number];
export type CommitmentFrequency = (typeof COMMITMENT_FREQUENCIES)[number];

export type StepKey =
  | "topic"
  | "details"
  | "expertise"
  | "expertiseDetails"
  | "commitment"
  | "duration"
  | "done";

export interface Message {
  role: "system" | "user";
  text: string;
}

export interface LearningPlanData {
  whatToLearn: string;
  openDetail: string;
  currentExpertise: ExpertiseLevel;
  expertiseDetail: string;
  totalModules: number;
}

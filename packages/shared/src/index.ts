// Platform abstractions
export { setSupabaseClient, getSupabaseClient } from "./supabase";
export { type StorageAdapter, setStorageAdapter, getStorage } from "./storage";

// Constants
export * from "./constants";

// Types
export type { FeedbackMessage } from "./types";

// Utils
export { formatDate, getDueStatus } from "./utils";
export { normalizeName, generateHexSuffix, generateUsername } from "./utils";

// Schedule
export {
  MAX_ENROLLMENT_DAYS,
  type ModuleStatus,
  type ModuleScheduleEntry,
  type ModuleStatusEntry,
  todayUTC,
  generateModuleSchedule,
  calculateProjectedDays,
  type CommitmentValidationResult,
  validateCommitment,
  resolveModuleStatuses,
} from "./schedule";

// Hooks
export * from "./hooks";

// i18n
export * from "./i18n";

// LLM
export * from "./llm";

// Validation
export * from "./validation";

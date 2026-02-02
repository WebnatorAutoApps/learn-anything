// Platform abstractions
export { setApiBaseUrl, getApiBaseUrl, apiUrl } from "./config";
export { type StorageAdapter, setStorageAdapter, getStorage } from "./storage";
export { setAuthTokenProvider, getAuthToken } from "./auth";

// Constants
export * from "./constants";

// Types
export type { FeedbackMessage } from "./types";

// Utils
export { formatDate, getDueStatus } from "./utils";

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

// API types
export * from "./api";

// Validation
export * from "./validation";

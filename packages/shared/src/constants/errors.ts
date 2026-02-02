export const ERROR_MESSAGES = {
  // General
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection and try again.",
  UNEXPECTED: "An unexpected error occurred",
  NOT_AUTHENTICATED: "Not authenticated",

  // Rate Limiting
  RATE_LIMIT_LOGIN: "Too many login attempts. Please try again later.",
  RATE_LIMIT_SIGNUP: "Too many signup attempts. Please try again later.",
  RATE_LIMIT_COURSE_CREATION: "Too many course creation requests. Please try again later.",

  // Auth / Login / Signup
  EMAIL_PASSWORD_REQUIRED: "Email and password are required",

  // Course
  COURSE_NOT_FOUND: "Learning path not found",
  COURSE_LOAD_FAILED: "Failed to load course",
  ENROLL_FAILED: "Failed to enroll. Please try again.",
  UNENROLL_FAILED: "Failed to unenroll. Please try again.",
  COURSE_CREATION_FAILED: "Something went wrong. Please try again.",
  MISSING_REQUIRED_FIELDS: "Missing required fields",
  NO_API_KEY: "No Gemini API key found. Please add your API key in Settings.",
  DECRYPT_FAILED: "Server configuration error — unable to decrypt API key",
  COURSE_INSERT_FAILED: "Failed to create course",
  MODULES_INSERT_FAILED: "Failed to create modules",
  PROJECTS_INSERT_FAILED: "Failed to create projects",
  COURSES_FETCH_FAILED: "Failed to fetch courses",
  MODULES_FETCH_FAILED: "Failed to fetch modules",
  PROJECTS_FETCH_FAILED: "Failed to fetch projects",

  // Enrollment
  COURSE_NOT_FOUND_404: "Course not found",
  ENROLL_FAILED_500: "Failed to enroll",
  UNENROLL_FAILED_500: "Failed to unenroll",
  INVALID_ENROLL_ACTION: "Invalid action. Use 'enroll' or 'unenroll'.",
  ALREADY_STARTED: "Course is already started",
  ALREADY_UNENROLLED: "Course is already unenrolled",
  ENROLLMENT_UPDATE_FAILED: "Failed to update enrollment status",
  COMMITMENT_TOO_LONG: "commitment_too_long",

  // Projects
  MODULE_PROJECT_REQUIRED: "moduleId and projectId are required",
  MODULE_NOT_FOUND: "Module not found in this course",
  PROJECT_NOT_FOUND: "Project not found in this module",
  PROJECT_SELECT_FAILED: "Failed to select project",
  MODULE_ID_REQUIRED: "moduleId is required",
  COMMENT_MUST_BE_STRING: "comment must be a string",
  IMAGE_URL_MUST_BE_STRING: "imageUrl must be a string",
  NO_PROJECT_SELECTED: "No project selected for this module",
  PROJECT_COMPLETE_FAILED: "Failed to mark project as completed",

  // Upload
  NO_FILE_PROVIDED: "No file provided",
  UPLOAD_FAILED: "Failed to upload image",

  // Profile / Settings
  USERNAME_EMPTY: "Username cannot be empty.",
  USERNAME_REQUIRED: "Username is required.",
  USERNAME_UPDATE_FAILED: "Failed to update username.",
  USERNAME_TAKEN: "This username is already in use.",
  DISPLAY_NAME_REQUIRED: "Display name is required",
  DISPLAY_NAME_UPDATE_FAILED: "Failed to update display name.",
  PROFILE_UPDATE_FAILED: "Failed to update profile",
  AVATAR_INVALID_TYPE: "Invalid file type. Use JPEG, PNG, or WebP.",
  AVATAR_TOO_LARGE: "File too large. Maximum size is 5 MB.",
  AVATAR_UPLOAD_FAILED: "Failed to upload profile picture.",
  AVATAR_UPLOAD_OK_PROFILE_FAILED: "Avatar uploaded but failed to update profile",
  EMAIL_UPDATE_FAILED: "Failed to update email.",
  EMAIL_REQUIRED: "Email is required",
  EMAIL_SAME: "New email is the same as the current email",
  EMAIL_ALREADY_IN_USE: "This email is already in use by another account",
  EMAIL_OAUTH_BLOCKED: "Email cannot be changed for accounts signed in with a third-party provider",
  PASSWORD_CURRENT_REQUIRED: "Current password is required.",
  PASSWORD_NEW_REQUIRED: "New password is required.",
  PASSWORD_TOO_SHORT: "New password must be at least 6 characters.",
  PASSWORD_MISMATCH: "New passwords do not match.",
  PASSWORD_UPDATE_FAILED: "Failed to update password.",
  PASSWORD_INCORRECT: "Current password is incorrect",
  PASSWORD_OAUTH_BLOCKED: "Password cannot be changed for accounts signed in with a third-party provider",

  // Settings (API keys, tone, theme)
  USERNAME_USE_DEDICATED_ENDPOINT: "Use PUT /api/user/username to change your username",
  INVALID_API_KEY_FORMAT: "Invalid API key format",
  INVALID_TONE_FORMAT: "Invalid tone format",
  ENCRYPT_FAILED: "Server configuration error — unable to encrypt API key",
  NO_FIELDS_TO_UPDATE: "No valid fields to update",
  SETTINGS_UPDATE_FAILED: "Failed to update settings",
  PROFILE_NOT_FOUND: "Profile not found — please reload and try again",

  // API Keys
  API_KEY_SAVE_FAILED: "Failed to save API key.",
  API_KEY_CLEAR_FAILED: "Failed to clear API key.",

  // Tone
  TONE_EMPTY: "Custom tone cannot be empty.",
  TONE_SAVE_FAILED: "Failed to save tone preference.",
  TONE_RESET_FAILED: "Failed to reset tone preference.",

  // Theme
  THEME_SAVE_FAILED: "Failed to save theme.",

  // Image Upload (shared constants for both upload routes)
  FILE_INVALID_TYPE: "Invalid file type. Accepted formats: JPEG, PNG, WebP",
  FILE_TOO_LARGE: "File too large. Maximum size is 10 MB",
  AVATAR_FILE_TOO_LARGE: "File too large. Maximum size is 5 MB",

  // Settings loading
  SETTINGS_LOAD_FAILED: "Failed to load settings. Please try again later.",

  // HTTP status-specific (course creation / LLM)
  SERVICE_OVERLOADED: "The AI service is temporarily overloaded. Please try again in a few moments.",
  RATE_LIMITED: "Too many requests. Please wait a moment before trying again.",
  SERVICE_UNAVAILABLE: "The service is temporarily unavailable. Please try again shortly.",
  REQUEST_TIMEOUT: "The request took too long. Please try again.",
  FORBIDDEN: "Access denied. Please check your API key and try again.",
} as const;

/**
 * Maps HTTP status codes to user-friendly i18n error keys.
 * Falls back to "generic" for unmapped codes.
 */
const HTTP_STATUS_ERROR_MAP: Record<number, string> = {
  429: "rateLimited",
  503: "serviceOverloaded",
  502: "serviceUnavailable",
  504: "requestTimeout",
  408: "requestTimeout",
  403: "forbidden",
};

/**
 * Returns an i18n error key based on an HTTP status code.
 * Used by the client to display translated, user-friendly error messages.
 */
export function getErrorKeyForStatus(status: number | undefined): string | null {
  if (!status) return null;
  return HTTP_STATUS_ERROR_MAP[status] ?? null;
}

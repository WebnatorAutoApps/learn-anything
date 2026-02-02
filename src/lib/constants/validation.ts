/** Maximum file size for avatar uploads (5 MB). */
export const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

/** Maximum file size for completion image uploads (10 MB). */
export const MAX_COMPLETION_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed MIME types for image uploads. */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Maximum length for AI tone instructions. */
export const MAX_TONE_LENGTH = 500;

/** Maximum length for display names. */
export const MAX_DISPLAY_NAME_LENGTH = 100;

/** Maximum length for project completion comments. */
export const MAX_COMMENT_LENGTH = 2000;

/** Minimum length for usernames. */
export const USERNAME_MIN_LENGTH = 3;

/** Maximum length for usernames. */
export const USERNAME_MAX_LENGTH = 39;

/**
 * Username format regex (must match the DB check constraint):
 * - Only lowercase letters, digits, and hyphens
 * - Between 3 and 39 characters
 * - Cannot start or end with a hyphen
 * - No consecutive hyphens
 */
export const USERNAME_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/** Minimum password length. */
export const PASSWORD_MIN_LENGTH = 6;

/** Default commitment interval in days when enrolling. */
export const DEFAULT_COMMITMENT_INTERVAL_DAYS = 3;

/** Minimum number of modules required for a learning program. */
export const MIN_MODULES = 5;

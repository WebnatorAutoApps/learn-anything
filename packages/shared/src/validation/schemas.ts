import { z } from "zod";
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX,
  PASSWORD_MIN_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_TONE_LENGTH,
  MIN_MODULES,
} from "../constants/validation";
import { VALID_THEMES, type ThemeKey } from "../constants/themes";

/** Username: 3-39 chars, lowercase alphanumeric + hyphens, no consecutive hyphens. */
export const usernameSchema = z
  .string()
  .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters.`)
  .max(USERNAME_MAX_LENGTH, `Username must be ${USERNAME_MAX_LENGTH} characters or less.`)
  .regex(
    USERNAME_REGEX,
    "Username can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen."
  )
  .refine((val) => !val.includes("--"), {
    message: "Username cannot contain consecutive hyphens.",
  });

/** Display name: required, max 100 chars. */
export const displayNameSchema = z
  .string()
  .min(1, "Display name is required.")
  .max(MAX_DISPLAY_NAME_LENGTH, `Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or less.`);

/** Password: min 6 chars. */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);

/** Email: valid email format. */
export const emailSchema = z
  .string()
  .min(1, "Email is required.")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format.");

/** Tone: optional, max 500 chars. */
export const toneSchema = z
  .string()
  .max(MAX_TONE_LENGTH, `Tone must be ${MAX_TONE_LENGTH} characters or less.`);

/** Theme: one of the valid theme keys. */
export const themeSchema = z.enum(VALID_THEMES as [ThemeKey, ...ThemeKey[]]);

/** Course creation: required fields for creating a new learning program. */
export const courseCreationSchema = z.object({
  whatToLearn: z.string().min(1, "What you want to learn is required."),
  openDetail: z.string().min(1, "Details about your learning goal are required."),
  currentExpertise: z.string().min(1, "Current expertise level is required."),
  expertiseDetail: z.string().optional(),
  totalModules: z.number().int().min(MIN_MODULES, `Must have at least ${MIN_MODULES} modules.`),
});

/** Commitment interval: positive integer within 365 days. */
export const commitmentSchema = z
  .number()
  .int("Commitment must be a whole number.")
  .positive("Commitment must be positive.")
  .max(365, "Commitment interval cannot exceed 365 days.");

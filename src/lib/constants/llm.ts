/** Temperature used for Gemini content generation. */
export const GEMINI_TEMPERATURE = 0.7;

/** Gemini API endpoint URL. */
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

/**
 * Minimum likelihood_of_learning (0-100) required to store a course.
 * Courses below this threshold will show a warning and won't be saved.
 */
export const LIKELIHOOD_THRESHOLD = 30;

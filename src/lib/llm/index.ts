import { GeminiProvider } from "./gemini";
import { LLMProvider } from "./types";

export { DEFAULT_TONE } from "./prompt";
export type { LearningRequest, LLMResponse, LLMModule, LLMProject, LLMProvider } from "./types";

/**
 * Minimum likelihood_of_learning (0-100) required to store a course.
 * Courses below this threshold will show a warning and won't be saved.
 */
export const LIKELIHOOD_THRESHOLD = 30;

export type LLMProviderType = "gemini";

export function createLLMProvider(provider: LLMProviderType, apiKey: string): LLMProvider {
  switch (provider) {
    case "gemini":
      return new GeminiProvider(apiKey);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

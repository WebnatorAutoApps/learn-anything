import { GeminiProvider } from "./gemini";
import { LLMProvider } from "./types";

export { DEFAULT_TONE } from "./prompt";
export type { LearningRequest, LLMResponse, LLMModule, LLMProject, LLMProvider } from "./types";
export { LIKELIHOOD_THRESHOLD } from "@/lib/constants/llm";

export type LLMProviderType = "gemini";

export function createLLMProvider(provider: LLMProviderType, apiKey: string): LLMProvider {
  switch (provider) {
    case "gemini":
      return new GeminiProvider(apiKey);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

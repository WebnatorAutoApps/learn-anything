import { GeminiProvider } from "./gemini";
import type { LLMProvider } from "@learn-anything/shared";

export type LLMProviderType = "gemini";

export function createLLMProvider(provider: LLMProviderType, apiKey: string): LLMProvider {
  switch (provider) {
    case "gemini":
      return new GeminiProvider(apiKey);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

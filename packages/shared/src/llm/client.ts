/**
 * Client-side Gemini caller.
 *
 * Calls the Gemini API directly from the client using the user's
 * locally-stored API key. No server proxy needed.
 */

import { GEMINI_API_URL, GEMINI_TEMPERATURE } from "../constants/llm";
import { ERROR_MESSAGES } from "../constants/errors";
import { buildSystemPrompt, buildUserPrompt } from "./prompt";
import type { LearningRequest, LLMResponse } from "./types";

export async function callGemini(
  apiKey: string,
  request: LearningRequest,
  signal?: AbortSignal
): Promise<LLMResponse> {
  const userPrompt = buildUserPrompt(request);
  const systemPrompt = buildSystemPrompt(request.tone, request.locale);

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: GEMINI_TEMPERATURE,
      },
    }),
    signal,
  });

  if (!response.ok) {
    if (response.status === 400 || response.status === 403) {
      throw new Error(ERROR_MESSAGES.GEMINI_INVALID_KEY);
    }
    if (response.status === 429) {
      throw new Error(ERROR_MESSAGES.GEMINI_RATE_LIMITED);
    }
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(ERROR_MESSAGES.GEMINI_EMPTY_RESPONSE);
  }

  const parsed = JSON.parse(text) as LLMResponse;

  if (!parsed.normalized_title || !parsed.program || !Array.isArray(parsed.program)) {
    throw new Error(ERROR_MESSAGES.GEMINI_INVALID_RESPONSE);
  }

  if (typeof parsed.likelihood_of_learning !== "number") {
    throw new Error(ERROR_MESSAGES.GEMINI_INVALID_LIKELIHOOD);
  }

  return parsed;
}

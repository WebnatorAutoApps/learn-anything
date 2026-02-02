import { LLMProvider, LearningRequest, LLMResponse } from "./types";
import { buildSystemPrompt, buildUserPrompt } from "./prompt";
import { GEMINI_API_URL, GEMINI_TEMPERATURE } from "@/lib/constants/llm";

export class GeminiProvider implements LLMProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCourse(request: LearningRequest): Promise<LLMResponse> {
    const userPrompt = buildUserPrompt(request);
    const systemPrompt = buildSystemPrompt(request.tone);

    const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
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
    });

    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 400 || response.status === 403) {
        throw new Error("Invalid Gemini API key. Please check your key in Settings.");
      }
      if (response.status === 429) {
        throw new Error("Gemini API rate limit exceeded. Please try again later.");
      }
      throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini returned an empty response. Please try again.");
    }

    const parsed = JSON.parse(text) as LLMResponse;

    // Basic validation
    if (!parsed.normalized_title || !parsed.program || !Array.isArray(parsed.program)) {
      throw new Error("Gemini returned an invalid response structure.");
    }

    if (typeof parsed.likelihood_of_learning !== "number") {
      throw new Error("Gemini returned an invalid likelihood value.");
    }

    return parsed;
  }
}

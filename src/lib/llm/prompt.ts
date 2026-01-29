import { LearningRequest } from "./types";

export const SYSTEM_PROMPT = `You are an expert learning program designer. You create practical, project-based learning programs tailored to the learner's goals and expertise level. You always respond with valid JSON only, no explanations or additional text.`;

export function buildUserPrompt(request: LearningRequest): string {
  return `You will receive information about a person who wants to learn something.

INPUT:

Learning goal (short):
${request.learning_goal_short}

Learning goal (detailed explanation):
${request.learning_goal_long}

Current expertise level (one of: No clue, Beginner, Intermediate, Advanced, Expert):
${request.expertise_level}

Expertise details:
${request.expertise_details}

Number of modules to generate:
${request.number_of_modules}

---

TASKS:

1. Normalize the learning goal into a SHORT TITLE.
   - 1 to 3 words.
   - Capitalized.
   - Examples:
     - "Learn Python programming language" → "Python"
     - "Learn how to cook like a pro" → "Cooking"
     - "Last longer in bed" → "Sex"

2. Estimate the EXPECTED SKILL LEVEL at the end of the program.
   - Must be one of: No clue, Beginner, Intermediate, Advanced, Expert.
   - Base your estimation on:
     - Initial expertise.
     - Expertise details.
     - Number of modules.
     - Realistic improvement through small projects only.

3. Estimate the LIKELIHOOD OF LEARNING this skill through this program.
   - Return a number between 0 and 100.
   - This represents how realistic it is to make meaningful progress using small, practical projects.
   - Examples:
     - Learning Python basics → high likelihood.
     - Becoming an astronaut in 3 months → near zero.
     - Improving communication skills → medium to high.

4. Generate a LEARNING PROGRAM composed of exactly ${request.number_of_modules} modules.

PROGRAM RULES (VERY IMPORTANT):

- Every module MUST be a practical project.
- No theoretical lessons.
- No passive learning.
- No generic advice.

For EACH MODULE:
- Provide a module title.
- Provide a short module description.
- Provide EXACTLY 3 project options.

For EACH PROJECT OPTION:
- Provide a project title.
- Provide clear, actionable execution instructions.
  - Instructions may include:
    - What to do.
    - How to do it.
    - What to look for or research.
- Provide a clear objective describing what the learner should achieve.

Projects must:
- Be small and achievable.
- Increase slightly in difficulty over time.
- Be appropriate for the learner's context and expertise.

If something is unclear, choose the safest and simplest interpretation.

---

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "normalized_title": string,
  "expected_skill_level": "No clue" | "Beginner" | "Intermediate" | "Advanced" | "Expert",
  "likelihood_of_learning": number,
  "program": [
    {
      "module_index": number,
      "module_title": string,
      "module_description": string,
      "projects": [
        {
          "project_title": string,
          "instructions": string,
          "objective": string
        }
      ]
    }
  ]
}

Return ONLY valid JSON.
Do not include explanations or additional text.`;
}

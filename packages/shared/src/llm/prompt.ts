import { LearningRequest } from "./types";

export const DEFAULT_TONE = "You are fun, supportive, motivational, and upbeat. Encourage the user and keep the energy high.";

export function buildSystemPrompt(tone?: string | null, locale?: string | null): string {
  const toneInstruction = (tone && tone.trim()) ? tone.trim() : DEFAULT_TONE;
  const language = locale || "English";
  return `You are an expert learning program designer. You create practical, project-based learning programs tailored to the learner's goals and expertise level. You always respond with valid JSON only, no explanations or additional text.

LANGUAGE RULE: Write ALL content (titles, descriptions, instructions, objectives) in ${language}. The only exception is the JSON keys, which must remain in English.

CRITICAL DESIGN PRINCIPLE — Modules vs Projects:
- MODULES are sequential steps that build on each other, progressing from foundational to advanced skills.
- PROJECTS within a module are PARALLEL ALTERNATIVES, not incremental steps. Each project teaches the SAME skill through a DIFFERENT context or application. The learner picks ONE project and learns the module's skill equally well regardless of which they choose.
- Never make one project a prerequisite for another within the same module.
- Never make projects progressively add features or complexity within the same module.

Communication style: ${toneInstruction}`;
}

export const SYSTEM_PROMPT = buildSystemPrompt();

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
- Be appropriate for the learner's context and expertise.

CRITICAL — Projects are PARALLEL ALTERNATIVES, not incremental steps:
- The 3 projects within a module must each teach the SAME core skill through DIFFERENT contexts or applications.
- A learner who completes ANY ONE of the 3 projects should learn the module's skill equally well.
- Projects must NOT build on each other or assume knowledge from another project in the same module.
- Projects must NOT progressively add features or complexity within the same module.

CORRECT EXAMPLE (parallel alternatives — all teach the same skill):
  Module: "HTTP Request Handling" (Node.js course)
  - Project 1: Build a server that returns HTML pages
  - Project 2: Build a server that returns JSON data
  - Project 3: Build a server that returns image files
  (All three teach request handling; learner picks one.)

  Module: "Sandwich Assembly" (Cooking course)
  - Project 1: Make an egg sandwich
  - Project 2: Make a ham sandwich
  - Project 3: Make a veggie sandwich
  (All three teach sandwich assembly; learner picks one.)

INCORRECT EXAMPLE (incremental/cumulative — each depends on or adds to the previous):
  Module: "Server Basics" (Node.js course)
  - Project 1: Send a simple text message
  - Project 2: Serve an HTML page (builds on Project 1)
  - Project 3: Add URL routing (builds on Project 2)
  (This is WRONG — projects form a progression, not alternatives.)

  Module: "Breakfast Basics" (Cooking course)
  - Project 1: Make toast
  - Project 2: Make toast with eggs (adds to Project 1)
  - Project 3: Make toast with eggs and seasoning (adds to Project 2)
  (This is WRONG — each project adds to the previous one.)

Difficulty progression happens ACROSS modules, not within a module's project options.

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

IMPORTANT — Language:
All generated content (normalized_title, module_title, module_description, project_title, instructions, objective) MUST be written in ${request.locale || "English"}. JSON keys remain in English.

Return ONLY valid JSON.
Do not include explanations or additional text.`;
}

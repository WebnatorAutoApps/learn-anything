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
  const commitmentLabel = request.commitment_interval_days === 1 ? "daily"
    : request.commitment_interval_days <= 3 ? "every 3 days"
    : request.commitment_interval_days <= 7 ? "weekly"
    : request.commitment_interval_days <= 14 ? "bi-weekly"
    : "monthly";
  const totalPracticeSessions = request.number_of_modules;
  const totalTimeSpanDays = request.duration_months * 30;

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

Commitment frequency:
${commitmentLabel} (one session every ${request.commitment_interval_days} day${request.commitment_interval_days !== 1 ? "s" : ""})

Total program duration:
${request.duration_months} month${request.duration_months !== 1 ? "s" : ""} (${totalTimeSpanDays} days total, ${totalPracticeSessions} practice sessions)

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
     - Number of modules AND how spread out they are (commitment frequency + duration).
     - Realistic improvement through small projects only.
   - A person doing 6 modules over 6 months (monthly) learns MUCH LESS than someone doing 6 modules in 6 days (daily). Account for spacing and total practice time.

3. Estimate the LIKELIHOOD OF LEARNING this skill through this program.
   - Return a number between 0 and 100.
   - This represents how realistic it is to achieve the learner's STATED GOALS given ALL of these factors: starting level, number of modules, commitment frequency, total duration, and the learning method (small practical projects).
   - Be BRUTALLY HONEST. Do not inflate this number to be encouraging. A realistic assessment helps the learner set proper expectations. Err on the side of being too harsh rather than too generous.
   - CRITICAL: The likelihood must reflect the STATED GOAL, not just "will they learn something." If someone says they want to play piano professionally, judge against THAT specific goal, not against "will they learn some piano basics."
   - THE MOST IMPORTANT FACTOR is: can the stated goal realistically be achieved in the given number of modules? Each module is ONE small practical project. Think about how many practice sessions a goal truly requires:
     - Learning basics of a simple topic: 4-8 modules may suffice.
     - Reaching intermediate level in a complex skill: typically 20-50+ modules.
     - Professional/expert mastery of ANY complex skill: requires hundreds to thousands of hours of practice — 6-12 modules is laughably insufficient.
   - Key factors (in order of importance):
     1. The gap between current expertise and the STATED goal vs the number of modules available. This is the dominant factor. If the goal requires 100+ modules but only 6 are available, likelihood must be very low regardless of all other factors.
     2. Whether professional/expert-level goals are realistic through small self-directed projects alone (usually not — they require formal instruction, mentorship, feedback loops, and thousands of hours).
     3. Whether the skill can be meaningfully learned through small projects at all.
     4. The commitment frequency and total duration as secondary context.
   - Scale guidance:
     - 80-100: Goal is very achievable with the given modules (e.g., learning basics of a simple skill in 6+ modules).
     - 60-79: Achievable but challenging (e.g., reaching solid beginner/intermediate in a skill with 10+ well-structured modules).
     - 40-59: Stretch goal — partial progress likely, full stated goal unlikely with this module count.
     - 20-39: Unrealistic for the plan — some learning but far short of the stated ambition.
     - 0-19: Essentially impossible with this plan (e.g., any professional-level goal from zero in under 20 modules).
   - Examples:
     - "Learn Python basics" from no experience in 6 modules → 80-90 (basics are achievable in 6 modules).
     - "Play piano professionally and do concerts" from "never seen a piano" in 6 modules → 1-3 (professional piano requires 10,000+ hours of practice, not 6 projects).
     - "Become conversational in Spanish" from beginner in 12 modules → 30-40 (conversational fluency requires far more practice than 12 projects).
     - "Cook basic meals" from no experience in 4 modules → 75-85 (basic cooking is achievable in a few modules).
     - "Become a professional chef" from zero in 6 modules → 2-5 (professional culinary skills require years of training).
     - "Become an astronaut" → 0 (not a learnable skill through projects).

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

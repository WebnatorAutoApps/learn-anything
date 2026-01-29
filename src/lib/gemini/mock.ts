/**
 * Mock Gemini service that returns a fake learning program response.
 * This will be replaced with a real Gemini API call in the future.
 */

export interface GeminiProject {
  project_title: string;
  instructions: string;
  objective: string;
}

export interface GeminiModule {
  module_index: number;
  module_title: string;
  module_description: string;
  projects: GeminiProject[];
}

export interface GeminiResponse {
  normalized_title: string;
  expected_skill_level: string;
  likelihood_of_learning: number;
  program: GeminiModule[];
}

export interface LearningRequest {
  learning_goal_short: string;
  learning_goal_long: string;
  expertise_level: string;
  expertise_details: string;
  number_of_modules: number;
}

function normalizeTitle(goal: string): string {
  const words = goal.trim().split(/\s+/);
  if (words.length <= 3) {
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  // Take the most meaningful words (skip common filler words)
  const filler = new Set(["how", "to", "learn", "about", "the", "a", "an", "i", "want", "like"]);
  const meaningful = words.filter((w) => !filler.has(w.toLowerCase()));
  return meaningful
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function estimateSkillLevel(currentLevel: string, modules: number): string {
  const levels = ["No clue", "Beginner", "Intermediate", "Advanced", "Expert"];
  const currentIndex = levels.indexOf(currentLevel);
  if (currentIndex === -1) return "Beginner";

  let bump = 0;
  if (modules >= 30) bump = 2;
  else if (modules >= 10) bump = 1;

  const newIndex = Math.min(currentIndex + bump, levels.length - 1);
  return levels[newIndex];
}

function estimateLikelihood(currentLevel: string, modules: number): number {
  let base = 60;
  if (modules >= 20) base += 15;
  else if (modules >= 10) base += 10;
  else if (modules >= 5) base += 5;

  if (currentLevel === "No clue") base -= 10;
  else if (currentLevel === "Beginner") base -= 5;
  else if (currentLevel === "Intermediate") base += 5;
  else if (currentLevel === "Advanced") base += 10;

  return Math.max(10, Math.min(95, base));
}

export function generateMockResponse(request: LearningRequest): GeminiResponse {
  const normalizedTitle = normalizeTitle(request.learning_goal_short);
  const expectedSkillLevel = estimateSkillLevel(request.expertise_level, request.number_of_modules);
  const likelihood = estimateLikelihood(request.expertise_level, request.number_of_modules);

  const program: GeminiModule[] = [];

  for (let i = 0; i < request.number_of_modules; i++) {
    const moduleNum = i + 1;
    const phase =
      moduleNum <= Math.ceil(request.number_of_modules * 0.3)
        ? "Foundation"
        : moduleNum <= Math.ceil(request.number_of_modules * 0.7)
          ? "Practice"
          : "Advanced";

    program.push({
      module_index: moduleNum,
      module_title: `${phase} Project ${moduleNum}: ${normalizedTitle} Essentials`,
      module_description: `A hands-on project to build your ${normalizedTitle.toLowerCase()} skills through practical application. This module focuses on ${phase.toLowerCase()}-level concepts.`,
      projects: [
        {
          project_title: `${normalizedTitle} Mini-Project ${moduleNum}A`,
          instructions: `Build a small project that demonstrates your understanding of ${normalizedTitle.toLowerCase()} concepts covered so far. Start by researching the key principles, then create a simple working example. Document what you learned along the way.`,
          objective: `Complete a working prototype that applies ${phase.toLowerCase()}-level ${normalizedTitle.toLowerCase()} concepts.`,
        },
        {
          project_title: `${normalizedTitle} Challenge ${moduleNum}B`,
          instructions: `Take on a structured challenge that pushes your current ${normalizedTitle.toLowerCase()} abilities. Follow the step-by-step guide, but try to add your own creative twist. Focus on understanding why each step works, not just how.`,
          objective: `Demonstrate problem-solving skills in ${normalizedTitle.toLowerCase()} by completing the challenge with at least one personal modification.`,
        },
        {
          project_title: `${normalizedTitle} Real-World Task ${moduleNum}C`,
          instructions: `Apply your ${normalizedTitle.toLowerCase()} knowledge to a real-world scenario. Identify a practical problem you can solve, plan your approach, execute it, and reflect on the results. Share your work with someone for feedback.`,
          objective: `Solve a real-world problem using ${normalizedTitle.toLowerCase()} skills and receive feedback on your solution.`,
        },
      ],
    });
  }

  return {
    normalized_title: normalizedTitle,
    expected_skill_level: expectedSkillLevel,
    likelihood_of_learning: likelihood,
    program,
  };
}

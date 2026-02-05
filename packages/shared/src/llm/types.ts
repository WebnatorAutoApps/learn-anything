export interface LearningRequest {
  learning_goal_short: string;
  learning_goal_long: string;
  expertise_level: string;
  expertise_details: string;
  number_of_modules: number;
  commitment_interval_days: number;
  duration_months: number;
  tone?: string | null;
  locale?: string | null;
}

export interface LLMProject {
  project_title: string;
  instructions: string;
  objective: string;
}

export interface LLMModule {
  module_index: number;
  module_title: string;
  module_description: string;
  projects: LLMProject[];
}

export interface LLMResponse {
  normalized_title: string;
  expected_skill_level: string;
  likelihood_of_learning: number;
  program: LLMModule[];
}

export interface LLMProvider {
  generateCourse(request: LearningRequest): Promise<LLMResponse>;
}

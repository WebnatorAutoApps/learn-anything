import type { ThemeKey } from "@/lib/constants/themes";

export interface Profile {
  full_name: string;
  email: string;
  avatar_url: string | null;
  has_gemini_api_key: boolean;
  api_key_last4: string | null;
  username: string | null;
  auth_provider: string;
  tone: string | null;
  theme: ThemeKey | null;
}

export interface CourseListItem {
  id: string;
  normalized_title: string;
  expected_skill_level: string;
  likelihood_of_learning: number;
  total_modules: number;
  status: string;
  created_at: string;
  isEnrolled: boolean;
}

export interface Project {
  id: string;
  module_id: string;
  project_index: number;
  title: string;
  instructions: string;
  objective: string;
}

export interface ModuleSchedule {
  status: "CURRENT" | "NEXT_PREVIEW" | "LOCKED";
  unlockDate: string;
  dueDate: string;
}

export interface SelectedProject {
  projectId: string;
  completed: boolean;
  completedAt: string | null;
  comment: string | null;
  imageUrl: string | null;
}

export interface Module {
  id: string;
  module_index: number;
  title: string;
  description: string;
  projects: Project[];
  schedule: ModuleSchedule | null;
  selectedProject: SelectedProject | null;
}

export interface CourseDetail {
  id: string;
  normalized_title: string;
  learning_goal: string;
  learning_goal_details: string;
  expertise_level: string;
  expertise_details: string | null;
  expected_skill_level: string;
  likelihood_of_learning: number;
  total_modules: number;
  status: string;
  commitment_interval_days: number | null;
  created_at: string;
  modules: Module[];
}

export interface CourseDetailResponse {
  course: CourseDetail;
  isEnrolled: boolean;
  isOwner: boolean;
  isAuthenticated: boolean;
}

export interface UpcomingProject {
  id: string;
  title: string;
  projectIndex: number;
  moduleId: string;
  moduleName: string;
  moduleIndex: number;
  courseId: string;
  courseName: string;
  dueDate: string | null;
  totalModules: number;
}

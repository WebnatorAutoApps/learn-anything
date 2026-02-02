import type { ThemeKey } from "@/lib/constants/themes";

/* ── Generic wrappers ── */

export interface ApiSuccessResponse<T = Record<string, never>> {
  success: true;
} // merged with T at call sites via intersection

export interface ApiErrorResponse {
  success: false;
  error: string;
}

/* ── Auth routes ── */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  user: { id: string; email: string };
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignupResponse {
  success: true;
  user?: { id: string; email: string };
  message?: string;
  requiresConfirmation?: boolean;
}

/* ── User profile routes ── */

export interface UpdateUsernameRequest {
  username: string;
}

export interface UpdateUsernameResponse {
  success: true;
  username: string;
}

export interface UpdateProfileRequest {
  full_name: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdateEmailRequest {
  email: string;
}

export interface UpdateEmailResponse {
  success: true;
  message: string;
}

export interface UpdateSettingsRequest {
  gemini_api_key?: string;
  tone?: string;
  theme?: ThemeKey;
}

export interface UpdateSettingsResponse {
  success: true;
  api_key_last4?: string | null;
}

/* ── Course routes ── */

export interface CreateCourseRequest {
  whatToLearn: string;
  openDetail: string;
  currentExpertise: string;
  expertiseDetail?: string;
  totalModules: number;
}

export interface CreateCourseResponse {
  success: true;
  course: {
    id: string;
    normalized_title: string;
    expected_skill_level: string;
    likelihood_of_learning: number;
    total_modules: number;
  };
}

export interface CreateCourseLowLikelihoodResponse {
  success: false;
  low_likelihood: true;
  likelihood_of_learning: number;
  normalized_title: string;
  error: string;
}

export interface CoursesListResponse {
  success: true;
  courses: {
    id: string;
    normalized_title: string;
    expected_skill_level: string;
    likelihood_of_learning: number;
    total_modules: number;
    status: string;
    created_at: string;
    isEnrolled: boolean;
  }[];
}

/* ── Enrollment routes ── */

export interface EnrollRequest {
  commitmentIntervalDays?: number;
}

export interface EnrollPatchRequest {
  action: "enroll" | "unenroll";
  commitmentIntervalDays?: number;
}

/* ── Project routes ── */

export interface SelectProjectRequest {
  moduleId: string;
  projectId: string;
}

export interface CompleteProjectRequest {
  moduleId: string;
  comment?: string;
  imageUrl?: string;
}

/* ── Upload routes ── */

export interface UploadResponse {
  success: true;
  url: string;
}

export interface AvatarUploadResponse {
  success: true;
  avatar_url: string;
}

/* ── Upcoming projects ── */

export interface UpcomingProjectsResponse {
  success: true;
  projects: {
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
  }[];
}

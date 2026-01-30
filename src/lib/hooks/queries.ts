import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Query Keys ─────────────────────────────────────────────────────────────

export const queryKeys = {
  profile: ["profile"] as const,
  courses: (status: string) => ["courses", status] as const,
  course: (id: string) => ["course", id] as const,
  upcomingProjects: ["upcomingProjects"] as const,
};

// ── Fetch helpers ──────────────────────────────────────────────────────────

async function fetchJSON<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Request failed (${res.status})`);
    (error as Error & { status: number }).status = res.status;
    throw error;
  }
  return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Profile {
  full_name: string;
  email: string;
  avatar_url: string | null;
  has_gemini_api_key: boolean;
  api_key_last4: string | null;
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

interface CourseDetailResponse {
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

// ── Queries ────────────────────────────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () =>
      fetchJSON<{ profile: Profile }>("/api/user").then((d) => d.profile),
  });
}

export function useCourses(status: string) {
  return useQuery({
    queryKey: queryKeys.courses(status),
    queryFn: () =>
      fetchJSON<{ courses: CourseListItem[] }>(
        `/api/courses?status=${status}`
      ).then((d) => d.courses),
  });
}

export function useCourseDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.course(id),
    queryFn: () =>
      fetchJSON<CourseDetailResponse>(`/api/courses/${id}`),
  });
}

export function useUpcomingProjects() {
  return useQuery({
    queryKey: queryKeys.upcomingProjects,
    queryFn: () =>
      fetchJSON<{ projects: UpcomingProject[] }>("/api/projects/upcoming").then(
        (d) => d.projects
      ),
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planData: {
      whatToLearn: string;
      openDetail: string;
      currentExpertise: string;
      expertiseDetail: string;
      totalModules: number;
    }) =>
      fetchJSON<{
        success: boolean;
        course?: { id: string };
        low_likelihood?: boolean;
        likelihood_of_learning?: number;
        error?: string;
      }>("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      isOwner,
      commitmentIntervalDays,
    }: {
      courseId: string;
      isOwner: boolean;
      commitmentIntervalDays?: number;
    }) => {
      if (isOwner) {
        return fetchJSON<{ success: boolean }>(`/api/courses/${courseId}/enroll`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "enroll",
            commitmentIntervalDays,
          }),
        });
      }
      return fetchJSON<{ success: boolean }>(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commitmentIntervalDays }),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.course(variables.courseId),
      });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUnenrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      fetchJSON<{ success: boolean }>(`/api/courses/${courseId}/enroll`, {
        method: "DELETE",
      }),
    onSuccess: (_data, courseId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.course(courseId),
      });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: { gemini_api_key: string }) =>
      fetchJSON<{ success: boolean }>("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useSelectProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      projectId,
    }: {
      courseId: string;
      moduleId: string;
      projectId: string;
    }) =>
      fetchJSON<{ success: boolean }>(`/api/courses/${courseId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, projectId }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.course(variables.courseId),
      });
    },
  });
}

export function useCompleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      comment,
      imageUrl,
    }: {
      courseId: string;
      moduleId: string;
      comment?: string;
      imageUrl?: string;
    }) =>
      fetchJSON<{ success: boolean }>(`/api/courses/${courseId}/projects`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, comment, imageUrl }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.course(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.upcomingProjects,
      });
    },
  });
}

export function useUploadCompletionImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Upload failed (${res.status})`);
      }

      const data: { success: boolean; url: string } = await res.json();
      return data.url;
    },
  });
}

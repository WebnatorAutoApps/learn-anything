import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchJSON, fetchFormData } from "./fetch";
import type { ThemeKey } from "../constants/themes";

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
      queryClient.invalidateQueries({ queryKey: queryKeys.coursesAll });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.coursesAll });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.coursesAll });
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

export function useSaveTone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tone: string) =>
      fetchJSON<{ success: boolean }>("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useSaveTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (theme: ThemeKey) =>
      fetchJSON<{ success: boolean }>("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
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
    mutationFn: async (file: Blob) => {
      const formData = new FormData();
      formData.append("file", file);
      const data = await fetchFormData<{ success: boolean; url: string }>("/api/upload", formData);
      return data.url;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { full_name: string }) =>
      fetchJSON<{ success: boolean }>("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: Blob) => {
      const formData = new FormData();
      formData.append("file", file);
      const data = await fetchFormData<{ success: boolean; avatar_url: string }>("/api/user/avatar", formData);
      return data.avatar_url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useUpdateEmail() {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      fetchJSON<{ success: boolean; message: string }>("/api/user/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      fetchJSON<{ success: boolean }>("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { username: string }) =>
      fetchJSON<{ success: boolean; username: string }>("/api/user/username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

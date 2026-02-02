import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchJSON } from "./fetch";
import type { Profile, CourseListItem, CourseDetailResponse, UpcomingProject } from "./types";

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

export const queryKeys = {
  profile: ["profile"] as const,
  coursesAll: ["courses"] as const,
  courses: (status: string) => ["courses", status] as const,
  course: (id: string) => ["course", id] as const,
  upcomingProjects: ["upcomingProjects"] as const,
};

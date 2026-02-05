import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getSupabaseClient } from "../supabase";
import { generateUsername } from "../utils/username";
import { resolveModuleStatuses } from "../schedule";
import { ERROR_MESSAGES } from "../constants/errors";
import type { ModuleScheduleEntry } from "../schedule";
import type {
  Profile,
  CourseListItem,
  CourseDetailResponse,
  UpcomingProject,
} from "./types";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async (): Promise<Profile> => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      const profileSelect =
        "id, full_name, email, avatar_url, username, tone, theme, created_at, updated_at";
      const meta = user.user_metadata ?? {};

      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(profileSelect)
        .eq("id", user.id)
        .single();

      // Auto-create profile if it doesn't exist
      if (profileError && profileError.code === "PGRST116") {
        const fullName = meta.full_name || meta.name || null;
        const username = await generateUniqueUsername(fullName);

        const { data: newProfile, error: upsertError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            full_name: fullName,
            email: user.email || null,
            avatar_url: meta.avatar_url || meta.picture || null,
            username,
          })
          .select(profileSelect)
          .single();

        if (!upsertError && newProfile) {
          profile = newProfile;
          profileError = null;
        } else {
          console.error("Profile auto-create failed:", upsertError);
        }
      } else if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      const authProvider = user.app_metadata?.provider || "email";

      if (!profile) {
        return {
          full_name: meta.full_name || meta.name || null,
          email: user.email || null,
          avatar_url: meta.avatar_url || meta.picture || null,
          username: null,
          auth_provider: authProvider,
          tone: null,
          theme: null,
        };
      }

      const avatarUrl =
        profile.avatar_url ||
        meta.avatar_url ||
        meta.picture ||
        null;

      return {
        ...profile,
        avatar_url: avatarUrl,
        auth_provider: authProvider,
      };
    },
  });
}

async function generateUniqueUsername(
  fullName: string | null
): Promise<string> {
  const supabase = getSupabaseClient();
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const candidate = generateUsername(fullName);

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();

    if (!existing) {
      return candidate;
    }

    console.warn(
      `Username collision: "${candidate}" already exists (attempt ${attempt}/${maxAttempts})`
    );
  }

  throw new Error(
    `Failed to generate unique username after ${maxAttempts} attempts`
  );
}

export function useCourses(status: string) {
  return useQuery({
    queryKey: queryKeys.courses(status),
    queryFn: async (): Promise<CourseListItem[]> => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      let query = supabase
        .from("courses")
        .select(
          "id, normalized_title, expected_skill_level, likelihood_of_learning, total_modules, status, created_at"
        )
        .eq("user_id", user.id);

      if (status === "created" || status === "started") {
        query = query.eq("status", status);
      }

      const { data: courses, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Courses fetch error:", error);
        throw new Error(ERROR_MESSAGES.COURSES_FETCH_FAILED);
      }

      return (courses || []).map((course) => ({
        ...course,
        isEnrolled: course.status === "started",
      }));
    },
  });
}

export function useCourseDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.course(id),
    queryFn: async (): Promise<CourseDetailResponse> => {
      const supabase = getSupabaseClient();

      // Get current user (optional — may be unauthenticated)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Fetch course
      const { data: courseRow, error: courseError } = await supabase
        .from("courses")
        .select(
          "id, user_id, normalized_title, learning_goal, learning_goal_details, expertise_level, expertise_details, expected_skill_level, likelihood_of_learning, total_modules, status, commitment_interval_days, created_at"
        )
        .eq("id", id)
        .single();

      if (courseError || !courseRow) {
        const err = new Error(ERROR_MESSAGES.COURSE_NOT_FOUND);
        (err as Error & { status: number }).status = 404;
        throw err;
      }

      // Determine enrollment status
      const isOwner = user ? courseRow.user_id === user.id : false;
      let isEnrolled = isOwner && courseRow.status === "started";
      let enrollmentId: string | null = null;
      let enrollmentCommitmentDays: number | null = null;

      if (user && !isOwner) {
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("id, commitment_interval_days")
          .eq("user_id", user.id)
          .eq("course_id", id)
          .single();

        isEnrolled = !!enrollment;
        enrollmentId = enrollment?.id ?? null;
        enrollmentCommitmentDays =
          enrollment?.commitment_interval_days ?? null;
      }

      const course = {
        id: courseRow.id,
        normalized_title: courseRow.normalized_title,
        learning_goal: courseRow.learning_goal,
        learning_goal_details: courseRow.learning_goal_details,
        expertise_level: courseRow.expertise_level,
        expertise_details: courseRow.expertise_details,
        expected_skill_level: courseRow.expected_skill_level,
        likelihood_of_learning: courseRow.likelihood_of_learning,
        total_modules: courseRow.total_modules,
        status: courseRow.status,
        commitment_interval_days: isOwner
          ? courseRow.commitment_interval_days
          : enrollmentCommitmentDays ?? courseRow.commitment_interval_days,
        created_at: courseRow.created_at,
      };

      // Fetch modules
      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .select("id, module_index, title, description")
        .eq("course_id", id)
        .order("module_index", { ascending: true });

      if (modulesError) {
        throw new Error(ERROR_MESSAGES.MODULES_FETCH_FAILED);
      }

      // Fetch schedule data if enrolled
      const scheduleMap = new Map<
        string,
        { unlock_date: string; due_date: string }
      >();

      if (isEnrolled && user) {
        if (isOwner) {
          const { data: ownerSchedules } = await supabase
            .from("owner_module_schedules")
            .select("module_id, unlock_date, due_date")
            .eq("course_id", id)
            .eq("user_id", user.id);

          if (ownerSchedules) {
            for (const s of ownerSchedules) {
              scheduleMap.set(s.module_id, {
                unlock_date: s.unlock_date,
                due_date: s.due_date,
              });
            }
          }
        } else if (enrollmentId) {
          const { data: schedules } = await supabase
            .from("module_schedules")
            .select("module_id, unlock_date, due_date")
            .eq("enrollment_id", enrollmentId);

          if (schedules) {
            for (const s of schedules) {
              scheduleMap.set(s.module_id, {
                unlock_date: s.unlock_date,
                due_date: s.due_date,
              });
            }
          }
        }
      }

      // Build schedule status map
      const statusMap = new Map<
        string,
        { status: string; unlockDate: string; dueDate: string }
      >();

      if (scheduleMap.size > 0 && modules) {
        const scheduleEntries: ModuleScheduleEntry[] = modules
          .filter((m) => scheduleMap.has(m.id))
          .map((m) => ({
            moduleId: m.id,
            moduleIndex: m.module_index,
            unlockDate: scheduleMap.get(m.id)!.unlock_date,
            dueDate: scheduleMap.get(m.id)!.due_date,
          }));

        const resolved = resolveModuleStatuses(scheduleEntries);
        for (const entry of resolved) {
          statusMap.set(entry.moduleId, {
            status: entry.status,
            unlockDate: entry.unlockDate,
            dueDate: entry.dueDate,
          });
        }
      }

      // Fetch projects and selections if enrolled
      let modulesWithProjects;
      if (isEnrolled) {
        const moduleIds = (modules || []).map((m) => m.id);
        let projects: Array<{
          id: string;
          module_id: string;
          project_index: number;
          title: string;
          instructions: string;
          objective: string;
        }> = [];

        const projectSelectionsMap = new Map<
          string,
          {
            projectId: string;
            completed: boolean;
            completedAt: string | null;
            comment: string | null;
            imageUrl: string | null;
          }
        >();

        if (moduleIds.length > 0) {
          const { data: projectsData, error: projectsError } = await supabase
            .from("projects")
            .select(
              "id, module_id, project_index, title, instructions, objective"
            )
            .in("module_id", moduleIds)
            .order("project_index", { ascending: true });

          if (projectsError) {
            throw new Error(ERROR_MESSAGES.PROJECTS_FETCH_FAILED);
          }

          projects = projectsData || [];

          if (user) {
            const { data: selections } = await supabase
              .from("user_module_projects")
              .select(
                "module_id, project_id, completed, completed_at, comment, image_url"
              )
              .eq("user_id", user.id)
              .in("module_id", moduleIds);

            if (selections) {
              for (const sel of selections) {
                projectSelectionsMap.set(sel.module_id, {
                  projectId: sel.project_id,
                  completed: sel.completed,
                  completedAt: sel.completed_at,
                  comment: sel.comment,
                  imageUrl: sel.image_url,
                });
              }
            }
          }
        }

        modulesWithProjects = (modules || []).map((mod) => {
          const schedule = statusMap.get(mod.id);
          const selection = projectSelectionsMap.get(mod.id) ?? null;
          return {
            ...mod,
            projects: projects.filter((p) => p.module_id === mod.id),
            schedule: schedule
              ? {
                  status: schedule.status as "CURRENT" | "NEXT_PREVIEW" | "LOCKED",
                  unlockDate: schedule.unlockDate,
                  dueDate: schedule.dueDate,
                }
              : null,
            selectedProject: selection,
          };
        });
      } else {
        modulesWithProjects = (modules || []).map((mod) => ({
          ...mod,
          projects: [],
          schedule: null,
          selectedProject: null,
        }));
      }

      return {
        course: {
          ...course,
          modules: modulesWithProjects,
        },
        isEnrolled,
        isOwner,
        isAuthenticated: !!user,
      };
    },
  });
}

export function useUpcomingProjects() {
  return useQuery({
    queryKey: queryKeys.upcomingProjects,
    queryFn: async (): Promise<UpcomingProject[]> => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      // Find all enrolled courses
      const { data: ownedCourses } = await supabase
        .from("courses")
        .select("id, normalized_title")
        .eq("user_id", user.id)
        .eq("status", "started");

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id);

      const enrolledCourseIds = (enrollments || []).map((e) => e.course_id);

      let enrolledCourses: Array<{ id: string; normalized_title: string }> =
        [];
      if (enrolledCourseIds.length > 0) {
        const { data } = await supabase
          .from("courses")
          .select("id, normalized_title")
          .in("id", enrolledCourseIds);
        enrolledCourses = data || [];
      }

      const allCourses = [...(ownedCourses || []), ...enrolledCourses];
      if (allCourses.length === 0) return [];

      const courseMap = new Map(
        allCourses.map((c) => [c.id, c.normalized_title])
      );
      const allCourseIds = allCourses.map((c) => c.id);

      // Fetch modules
      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .select("id, course_id, module_index, title")
        .in("course_id", allCourseIds)
        .order("module_index", { ascending: true });

      if (modulesError || !modules || modules.length === 0) return [];

      const moduleIds = modules.map((m) => m.id);

      // Fetch projects
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, module_id, project_index, title")
        .in("module_id", moduleIds)
        .order("project_index", { ascending: true });

      if (projectsError || !projects || projects.length === 0) return [];

      // Fetch user's selections/completions
      const { data: userSelections } = await supabase
        .from("user_module_projects")
        .select("module_id, project_id, completed")
        .eq("user_id", user.id)
        .in("module_id", moduleIds);

      const completedModuleIds = new Set<string>();
      const selectedProjectByModule = new Map<string, string>();

      for (const sel of userSelections || []) {
        selectedProjectByModule.set(sel.module_id, sel.project_id);
        if (sel.completed) {
          completedModuleIds.add(sel.module_id);
        }
      }

      // Fetch schedules
      const ownedCourseIds = (ownedCourses || []).map((c) => c.id);
      const scheduleByModuleId = new Map<
        string,
        { dueDate: string; unlockDate: string }
      >();

      if (ownedCourseIds.length > 0) {
        const { data: ownerSchedules } = await supabase
          .from("owner_module_schedules")
          .select("module_id, due_date, unlock_date")
          .eq("user_id", user.id)
          .in("course_id", ownedCourseIds);

        if (ownerSchedules) {
          for (const s of ownerSchedules) {
            scheduleByModuleId.set(s.module_id, {
              dueDate: s.due_date,
              unlockDate: s.unlock_date,
            });
          }
        }
      }

      if (enrolledCourseIds.length > 0) {
        const { data: enrollmentRows } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", user.id)
          .in("course_id", enrolledCourseIds);

        if (enrollmentRows && enrollmentRows.length > 0) {
          const enrollmentIds = enrollmentRows.map((e) => e.id);
          const { data: moduleSchedules } = await supabase
            .from("module_schedules")
            .select("module_id, due_date, unlock_date")
            .in("enrollment_id", enrollmentIds);

          if (moduleSchedules) {
            for (const s of moduleSchedules) {
              scheduleByModuleId.set(s.module_id, {
                dueDate: s.due_date,
                unlockDate: s.unlock_date,
              });
            }
          }
        }
      }

      // Group projects by module
      const projectsByModule = new Map<string, typeof projects>();
      for (const p of projects) {
        const existing = projectsByModule.get(p.module_id) || [];
        existing.push(p);
        projectsByModule.set(p.module_id, existing);
      }

      // Group modules by course
      const modulesByCourse = new Map<string, typeof modules>();
      for (const mod of modules) {
        const existing = modulesByCourse.get(mod.course_id) || [];
        existing.push(mod);
        modulesByCourse.set(mod.course_id, existing);
      }

      const today = new Date().toISOString().slice(0, 10);
      const activeProjects: UpcomingProject[] = [];

      for (const [courseId, courseModules] of modulesByCourse) {
        const activeModule = courseModules.find((mod) => {
          if (completedModuleIds.has(mod.id)) return false;
          const schedule = scheduleByModuleId.get(mod.id);
          if (schedule && schedule.unlockDate > today) return false;
          return true;
        });
        if (!activeModule) continue;

        const moduleProjects = projectsByModule.get(activeModule.id);
        if (!moduleProjects || moduleProjects.length === 0) continue;

        const selectedProjectId = selectedProjectByModule.get(activeModule.id);
        const projectToShow = selectedProjectId
          ? moduleProjects.find((p) => p.id === selectedProjectId) ||
            moduleProjects[0]
          : moduleProjects[0];

        const courseName = courseMap.get(courseId) || "Unknown Course";
        const schedule = scheduleByModuleId.get(activeModule.id);
        const dueDate = schedule?.dueDate || null;

        activeProjects.push({
          id: projectToShow.id,
          title: projectToShow.title,
          projectIndex: projectToShow.project_index,
          moduleId: activeModule.id,
          moduleName: activeModule.title,
          moduleIndex: activeModule.module_index,
          courseId,
          courseName,
          dueDate,
          totalModules: courseModules.length,
        });
      }

      // Sort by due date (soonest first), nulls at end
      activeProjects.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          const cmp = a.dueDate.localeCompare(b.dueDate);
          if (cmp !== 0) return cmp;
        } else if (a.dueDate && !b.dueDate) {
          return -1;
        } else if (!a.dueDate && b.dueDate) {
          return 1;
        }
        const courseCmp = a.courseName.localeCompare(b.courseName);
        if (courseCmp !== 0) return courseCmp;
        return a.title.localeCompare(b.title);
      });

      return activeProjects;
    },
  });
}

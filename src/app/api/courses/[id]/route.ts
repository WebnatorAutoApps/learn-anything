import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveModuleStatuses, type ModuleScheduleEntry } from "@/lib/schedule";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch the course with user_id for ownership check
    const { data: courseRow, error: courseError } = await supabase
      .from("courses")
      .select(
        "id, user_id, normalized_title, learning_goal, learning_goal_details, expertise_level, expertise_details, expected_skill_level, likelihood_of_learning, total_modules, status, commitment_interval_days, created_at"
      )
      .eq("id", id)
      .single();

    if (courseError || !courseRow) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Determine enrollment status
    const isOwner = user ? courseRow.user_id === user.id : false;
    let isEnrolled = isOwner && courseRow.status === "started";
    let enrollmentId: string | null = null;

    if (user && !isOwner) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", id)
        .single();

      isEnrolled = !!enrollment;
      enrollmentId = enrollment?.id ?? null;
    }

    // Build course response object without user_id
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
      commitment_interval_days: courseRow.commitment_interval_days,
      created_at: courseRow.created_at,
    };

    // Fetch modules (publicly accessible)
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id, module_index, title, description")
      .eq("course_id", id)
      .order("module_index", { ascending: true });

    if (modulesError) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch modules" },
        { status: 500 }
      );
    }

    // Fetch schedule data if enrolled
    const scheduleMap: Map<string, { unlock_date: string; due_date: string }> =
      new Map();

    if (isEnrolled && user) {
      if (isOwner) {
        // Fetch from owner_module_schedules
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
        // Fetch from module_schedules
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

    // Build schedule entries for status resolution
    const hasSchedule = scheduleMap.size > 0;
    const statusMap: Map<string, { status: string; unlockDate: string; dueDate: string }> =
      new Map();

    if (hasSchedule && modules) {
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

    // Only fetch projects if the user is enrolled (owner or enrolled user)
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

      // Fetch user's project selections for all modules in this course
      const projectSelectionsMap: Map<
        string,
        { projectId: string; completed: boolean; completedAt: string | null }
      > = new Map();

      if (moduleIds.length > 0) {
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select(
            "id, module_id, project_index, title, instructions, objective"
          )
          .in("module_id", moduleIds)
          .order("project_index", { ascending: true });

        if (projectsError) {
          return NextResponse.json(
            { success: false, error: "Failed to fetch projects" },
            { status: 500 }
          );
        }

        projects = projectsData || [];

        // Fetch user's project selections
        if (user) {
          const { data: selections } = await supabase
            .from("user_module_projects")
            .select("module_id, project_id, completed, completed_at")
            .eq("user_id", user.id)
            .in("module_id", moduleIds);

          if (selections) {
            for (const sel of selections) {
              projectSelectionsMap.set(sel.module_id, {
                projectId: sel.project_id,
                completed: sel.completed,
                completedAt: sel.completed_at,
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
                status: schedule.status,
                unlockDate: schedule.unlockDate,
                dueDate: schedule.dueDate,
              }
            : null,
          selectedProject: selection,
        };
      });
    } else {
      // Unenrolled users get modules without projects or schedule
      modulesWithProjects = (modules || []).map((mod) => ({
        ...mod,
        projects: [],
        schedule: null,
        selectedProject: null,
      }));
    }

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        modules: modulesWithProjects,
      },
      isEnrolled,
      isOwner,
      isAuthenticated: !!user,
    });
  } catch (error) {
    console.error("Course fetch error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

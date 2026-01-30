import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find all courses the user is enrolled in:
    // 1. Courses they own with status 'started'
    // 2. Courses they're enrolled in via the enrollments table
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

    // Fetch enrolled (non-owned) course details
    let enrolledCourses: Array<{ id: string; normalized_title: string }> = [];
    if (enrolledCourseIds.length > 0) {
      const { data } = await supabase
        .from("courses")
        .select("id, normalized_title")
        .in("id", enrolledCourseIds);
      enrolledCourses = data || [];
    }

    // Combine all course IDs
    const allCourses = [...(ownedCourses || []), ...enrolledCourses];
    if (allCourses.length === 0) {
      return NextResponse.json({ success: true, projects: [] });
    }

    const courseMap = new Map(allCourses.map((c) => [c.id, c.normalized_title]));
    const allCourseIds = allCourses.map((c) => c.id);

    // Fetch all modules for these courses
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id, course_id, module_index, title")
      .in("course_id", allCourseIds)
      .order("module_index", { ascending: true });

    if (modulesError || !modules || modules.length === 0) {
      return NextResponse.json({ success: true, projects: [] });
    }

    const moduleIds = modules.map((m) => m.id);

    // Fetch all projects for these modules
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, module_id, project_index, title")
      .in("module_id", moduleIds)
      .order("project_index", { ascending: true });

    if (projectsError || !projects || projects.length === 0) {
      return NextResponse.json({ success: true, projects: [] });
    }

    // Fetch user's project selections/completions from user_module_projects
    const { data: userSelections } = await supabase
      .from("user_module_projects")
      .select("module_id, project_id, completed")
      .eq("user_id", user.id)
      .in("module_id", moduleIds);

    // Build maps for quick lookup
    const completedModuleIds = new Set<string>();
    const selectedProjectByModule = new Map<string, string>();

    for (const sel of userSelections || []) {
      selectedProjectByModule.set(sel.module_id, sel.project_id);
      if (sel.completed) {
        completedModuleIds.add(sel.module_id);
      }
    }

    // Fetch schedule data for due dates
    const ownedCourseIds = (ownedCourses || []).map((c) => c.id);
    const scheduleByModuleId = new Map<string, string>();

    if (ownedCourseIds.length > 0) {
      const { data: ownerSchedules } = await supabase
        .from("owner_module_schedules")
        .select("module_id, due_date")
        .eq("user_id", user.id)
        .in("course_id", ownedCourseIds);

      if (ownerSchedules) {
        for (const s of ownerSchedules) {
          scheduleByModuleId.set(s.module_id, s.due_date);
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
          .select("module_id, due_date")
          .in("enrollment_id", enrollmentIds);

        if (moduleSchedules) {
          for (const s of moduleSchedules) {
            scheduleByModuleId.set(s.module_id, s.due_date);
          }
        }
      }
    }

    // Build the list of incomplete projects.
    // For each module that isn't completed:
    // - If a project is selected, show that project
    // - If no project is selected, show the first project in the module
    const incompleteProjects: Array<{
      id: string;
      title: string;
      projectIndex: number;
      moduleId: string;
      moduleName: string;
      moduleIndex: number;
      courseId: string;
      courseName: string;
      dueDate: string | null;
    }> = [];

    // Group projects by module
    const projectsByModule = new Map<string, typeof projects>();
    for (const p of projects) {
      const existing = projectsByModule.get(p.module_id) || [];
      existing.push(p);
      projectsByModule.set(p.module_id, existing);
    }

    for (const mod of modules) {
      // Skip completed modules
      if (completedModuleIds.has(mod.id)) continue;

      const moduleProjects = projectsByModule.get(mod.id);
      if (!moduleProjects || moduleProjects.length === 0) continue;

      // Determine which project to show
      const selectedProjectId = selectedProjectByModule.get(mod.id);
      const projectToShow = selectedProjectId
        ? moduleProjects.find((p) => p.id === selectedProjectId) || moduleProjects[0]
        : moduleProjects[0];

      const courseName = courseMap.get(mod.course_id) || "Unknown Course";
      const dueDate = scheduleByModuleId.get(mod.id) || null;

      incompleteProjects.push({
        id: projectToShow.id,
        title: projectToShow.title,
        projectIndex: projectToShow.project_index,
        moduleId: mod.id,
        moduleName: mod.title,
        moduleIndex: mod.module_index,
        courseId: mod.course_id,
        courseName,
        dueDate,
      });
    }

    // Sort by due date (soonest first), nulls at the end
    // Secondary sort by course name, then project title
    incompleteProjects.sort((a, b) => {
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

    return NextResponse.json({ success: true, projects: incompleteProjects });
  } catch (error) {
    console.error("Upcoming projects fetch error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

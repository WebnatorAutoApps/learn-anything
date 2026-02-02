import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";

export const GET = withAuth(async (_request, { user, supabase }) => {
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

  // Fetch schedule data for due dates and unlock dates
  const ownedCourseIds = (ownedCourses || []).map((c) => c.id);
  const scheduleByModuleId = new Map<string, { dueDate: string; unlockDate: string }>();

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

  // Build the list of active projects — one per course.
  // The "active" module for a course is the earliest incomplete module
  // (lowest module_index that hasn't been completed).
  // Group projects by module
  const projectsByModule = new Map<string, typeof projects>();
  for (const p of projects) {
    const existing = projectsByModule.get(p.module_id) || [];
    existing.push(p);
    projectsByModule.set(p.module_id, existing);
  }

  // Group modules by course (already sorted by module_index from query)
  const modulesByCourse = new Map<string, typeof modules>();
  for (const mod of modules) {
    const existing = modulesByCourse.get(mod.course_id) || [];
    existing.push(mod);
    modulesByCourse.set(mod.course_id, existing);
  }

  const activeProjects: Array<{
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
  }> = [];

  // For each course, find the first incomplete AND unlocked module.
  // A module is considered unlocked if today >= its unlock_date.
  const today = new Date().toISOString().slice(0, 10);

  for (const [courseId, courseModules] of modulesByCourse) {
    const activeModule = courseModules.find((mod) => {
      if (completedModuleIds.has(mod.id)) return false;

      // Check unlock status from schedule data
      const schedule = scheduleByModuleId.get(mod.id);
      if (schedule && schedule.unlockDate > today) return false; // Still locked

      return true;
    });
    if (!activeModule) continue; // All modules completed or locked

    const moduleProjects = projectsByModule.get(activeModule.id);
    if (!moduleProjects || moduleProjects.length === 0) continue;

    // Determine which project to show
    const selectedProjectId = selectedProjectByModule.get(activeModule.id);
    const projectToShow = selectedProjectId
      ? moduleProjects.find((p) => p.id === selectedProjectId) || moduleProjects[0]
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

  // Sort by due date (soonest first), nulls at the end
  // Secondary sort by course name, then project title
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

  return NextResponse.json({ success: true, projects: activeProjects });
});

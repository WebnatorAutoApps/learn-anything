import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
        "id, user_id, normalized_title, learning_goal, learning_goal_details, expertise_level, expertise_details, expected_skill_level, likelihood_of_learning, total_modules, status, created_at"
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

    if (user && !isOwner) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", id)
        .single();

      isEnrolled = !!enrollment;
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
      }

      modulesWithProjects = (modules || []).map((mod) => ({
        ...mod,
        projects: projects.filter((p) => p.module_id === mod.id),
      }));
    } else {
      // Unenrolled users get modules without projects
      modulesWithProjects = (modules || []).map((mod) => ({
        ...mod,
        projects: [],
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

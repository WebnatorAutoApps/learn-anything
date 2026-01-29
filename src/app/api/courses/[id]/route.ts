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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch the course (RLS ensures only the owner can access)
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select(
        "id, normalized_title, learning_goal, learning_goal_details, expertise_level, expertise_details, expected_skill_level, likelihood_of_learning, total_modules, status, created_at"
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Fetch modules with their projects
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

    // Fetch all projects for this course's modules
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
        .select("id, module_id, project_index, title, instructions, objective")
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

    // Group projects by module
    const modulesWithProjects = (modules || []).map((mod) => ({
      ...mod,
      projects: projects.filter((p) => p.module_id === mod.id),
    }));

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        modules: modulesWithProjects,
      },
    });
  } catch (error) {
    console.error("Course fetch error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

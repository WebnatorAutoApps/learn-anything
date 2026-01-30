import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/courses/[id]/projects — Select a project for a module
 * Body: { moduleId: string, projectId: string }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
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

    const body = await request.json();
    const { moduleId, projectId } = body;

    if (!moduleId || !projectId) {
      return NextResponse.json(
        { success: false, error: "moduleId and projectId are required" },
        { status: 400 }
      );
    }

    // Verify the module belongs to this course
    const { data: mod, error: modError } = await supabase
      .from("modules")
      .select("id")
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .single();

    if (modError || !mod) {
      return NextResponse.json(
        { success: false, error: "Module not found in this course" },
        { status: 404 }
      );
    }

    // Verify the project belongs to this module
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("module_id", moduleId)
      .single();

    if (projError || !project) {
      return NextResponse.json(
        { success: false, error: "Project not found in this module" },
        { status: 404 }
      );
    }

    // Upsert: if user already selected a project for this module, replace it
    // Reset completion when switching projects
    const { error: upsertError } = await supabase
      .from("user_module_projects")
      .upsert(
        {
          user_id: user.id,
          module_id: moduleId,
          project_id: projectId,
          selected_at: new Date().toISOString(),
          completed: false,
          completed_at: null,
        },
        { onConflict: "user_id,module_id" }
      );

    if (upsertError) {
      console.error("Project selection error:", upsertError);
      return NextResponse.json(
        { success: false, error: "Failed to select project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Project selection error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/courses/[id]/projects — Mark a project as completed
 * Body: { moduleId: string }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
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

    const body = await request.json();
    const { moduleId } = body;

    if (!moduleId) {
      return NextResponse.json(
        { success: false, error: "moduleId is required" },
        { status: 400 }
      );
    }

    // Verify the module belongs to this course
    const { data: mod, error: modError } = await supabase
      .from("modules")
      .select("id")
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .single();

    if (modError || !mod) {
      return NextResponse.json(
        { success: false, error: "Module not found in this course" },
        { status: 404 }
      );
    }

    // Find the user's selected project for this module
    const { data: selection, error: selError } = await supabase
      .from("user_module_projects")
      .select("id, completed")
      .eq("user_id", user.id)
      .eq("module_id", moduleId)
      .single();

    if (selError || !selection) {
      return NextResponse.json(
        { success: false, error: "No project selected for this module" },
        { status: 404 }
      );
    }

    if (selection.completed) {
      return NextResponse.json(
        { success: true, already_completed: true },
        { status: 200 }
      );
    }

    const { error: updateError } = await supabase
      .from("user_module_projects")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", selection.id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Project completion error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to mark project as completed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Project completion error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { withAuthParams } from "@/lib/api/withAuth";
import { MAX_COMMENT_LENGTH } from "@/lib/constants/validation";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

/**
 * POST /api/courses/[id]/projects — Select a project for a module
 * Body: { moduleId: string, projectId: string }
 */
export const POST = withAuthParams<{ id: string }>(
  async (request, { user, supabase, params }) => {
    const { id: courseId } = params;

    const body = await request.json();
    const { moduleId, projectId } = body;

    if (!moduleId || !projectId) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.MODULE_PROJECT_REQUIRED },
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
        { success: false, error: ERROR_MESSAGES.MODULE_NOT_FOUND },
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
        { success: false, error: ERROR_MESSAGES.PROJECT_NOT_FOUND },
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
        { success: false, error: ERROR_MESSAGES.PROJECT_SELECT_FAILED },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }
);

/**
 * PATCH /api/courses/[id]/projects — Mark a project as completed
 * Body: { moduleId: string, comment?: string, imageUrl?: string }
 */
export const PATCH = withAuthParams<{ id: string }>(
  async (request, { user, supabase, params }) => {
    const { id: courseId } = params;

    const body = await request.json();
    const { moduleId, comment, imageUrl } = body;

    if (!moduleId) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.MODULE_ID_REQUIRED },
        { status: 400 }
      );
    }

    // Validate comment length
    if (comment !== undefined && comment !== null) {
      if (typeof comment !== "string") {
        return NextResponse.json(
          { success: false, error: ERROR_MESSAGES.COMMENT_MUST_BE_STRING },
          { status: 400 }
        );
      }
      if (comment.length > MAX_COMMENT_LENGTH) {
        return NextResponse.json(
          { success: false, error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer` },
          { status: 400 }
        );
      }
    }

    // Validate imageUrl if provided
    if (imageUrl !== undefined && imageUrl !== null) {
      if (typeof imageUrl !== "string") {
        return NextResponse.json(
          { success: false, error: ERROR_MESSAGES.IMAGE_URL_MUST_BE_STRING },
          { status: 400 }
        );
      }
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
        { success: false, error: ERROR_MESSAGES.MODULE_NOT_FOUND },
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
        { success: false, error: ERROR_MESSAGES.NO_PROJECT_SELECTED },
        { status: 404 }
      );
    }

    if (selection.completed) {
      return NextResponse.json(
        { success: true, already_completed: true },
        { status: 200 }
      );
    }

    const updateData: Record<string, unknown> = {
      completed: true,
      completed_at: new Date().toISOString(),
    };

    if (comment !== undefined && comment !== null) {
      updateData.comment = comment || null;
    }

    if (imageUrl !== undefined && imageUrl !== null) {
      updateData.image_url = imageUrl || null;
    }

    const { error: updateError } = await supabase
      .from("user_module_projects")
      .update(updateData)
      .eq("id", selection.id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Project completion error:", updateError);
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.PROJECT_COMPLETE_FAILED },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }
);

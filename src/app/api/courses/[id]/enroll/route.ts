import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
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

    const body = await request.json();
    const { action } = body;

    if (action !== "enroll" && action !== "unenroll") {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'enroll' or 'unenroll'." },
        { status: 400 }
      );
    }

    // Verify the course exists and belongs to the user
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, status")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const newStatus = action === "enroll" ? "started" : "created";

    // Guard against redundant status changes
    if (course.status === newStatus) {
      return NextResponse.json(
        {
          success: false,
          error:
            action === "enroll"
              ? "Course is already started"
              : "Course is already unenrolled",
        },
        { status: 409 }
      );
    }

    const { error: updateError } = await supabase
      .from("courses")
      .update({ status: newStatus })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Enrollment update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update enrollment status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

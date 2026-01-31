import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateModuleSchedule, todayUTC, validateCommitment } from "@/lib/schedule";

export async function DELETE(
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

    // Check if the user is the course owner
    const { data: course } = await supabase
      .from("courses")
      .select("id, user_id, status")
      .eq("id", id)
      .single();

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const isOwner = course.user_id === user.id;

    if (isOwner) {
      // Owner unenroll: change course status back to 'created'
      if (course.status === "created") {
        return NextResponse.json(
          { success: true, already_unenrolled: true },
          { status: 200 }
        );
      }

      const { error: updateError } = await supabase
        .from("courses")
        .update({ status: "created", commitment_interval_days: null })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Owner unenroll error:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to unenroll" },
          { status: 500 }
        );
      }

      // Delete owner module schedules
      await supabase
        .from("owner_module_schedules")
        .delete()
        .eq("course_id", id)
        .eq("user_id", user.id);
    } else {
      // Non-owner unenroll: delete enrollment record
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", id)
        .single();

      if (!enrollment) {
        // Already unenrolled or never enrolled — treat as success
        return NextResponse.json(
          { success: true, already_unenrolled: true },
          { status: 200 }
        );
      }

      // Delete module schedules first (cascade will also handle this,
      // but being explicit)
      await supabase
        .from("module_schedules")
        .delete()
        .eq("enrollment_id", enrollment.id);

      const { error: deleteError } = await supabase
        .from("enrollments")
        .delete()
        .eq("user_id", user.id)
        .eq("course_id", id);

      if (deleteError) {
        console.error("Enrollment delete error:", deleteError);
        return NextResponse.json(
          { success: false, error: "Failed to unenroll" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unenroll error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Parse commitmentIntervalDays from request body
    let commitmentIntervalDays = 3; // default
    try {
      const body = await request.json();
      if (
        body.commitmentIntervalDays &&
        typeof body.commitmentIntervalDays === "number" &&
        body.commitmentIntervalDays >= 1
      ) {
        commitmentIntervalDays = body.commitmentIntervalDays;
      }
    } catch {
      // No body or invalid JSON — use default
    }

    // Verify the course exists and get total_modules for validation
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, total_modules")
      .eq("id", id)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Validate commitment duration (must fit within 1 year)
    const validation = validateCommitment(
      course.total_modules,
      commitmentIntervalDays
    );
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "commitment_too_long",
          projectedDays: validation.projectedDays,
          projectedYears: validation.projectedYears,
          suggestedIntervalDays: validation.suggestedIntervalDays,
          stepCount: course.total_modules,
        },
        { status: 422 }
      );
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: true, already_enrolled: true },
        { status: 200 }
      );
    }

    // Create enrollment with commitment interval
    const { data: enrollment, error: enrollError } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: id,
        commitment_interval_days: commitmentIntervalDays,
      })
      .select("id")
      .single();

    if (enrollError || !enrollment) {
      console.error("Enrollment error:", enrollError);
      return NextResponse.json(
        { success: false, error: "Failed to enroll" },
        { status: 500 }
      );
    }

    // Fetch modules to generate schedule
    const { data: modules } = await supabase
      .from("modules")
      .select("id, module_index")
      .eq("course_id", id)
      .order("module_index", { ascending: true });

    if (modules && modules.length > 0) {
      const enrollmentDate = todayUTC();
      const schedule = generateModuleSchedule(
        modules,
        enrollmentDate,
        commitmentIntervalDays
      );

      const scheduleRows = schedule.map((entry) => ({
        enrollment_id: enrollment.id,
        module_id: entry.moduleId,
        unlock_date: entry.unlockDate,
        due_date: entry.dueDate,
      }));

      const { error: scheduleError } = await supabase
        .from("module_schedules")
        .insert(scheduleRows);

      if (scheduleError) {
        console.error("Schedule creation error:", scheduleError);
        // Non-fatal: enrollment succeeded but schedule failed
        // The course view will fall back to showing all modules unlocked
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

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
    const { action, commitmentIntervalDays } = body;

    if (action !== "enroll" && action !== "unenroll") {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'enroll' or 'unenroll'." },
        { status: 400 }
      );
    }

    // Verify the course exists and belongs to the user
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, status, total_modules")
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

    const intervalDays =
      typeof commitmentIntervalDays === "number" && commitmentIntervalDays >= 1
        ? commitmentIntervalDays
        : 3;

    // Validate commitment duration for enrollment (must fit within 1 year)
    if (action === "enroll") {
      const validation = validateCommitment(course.total_modules, intervalDays);
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: "commitment_too_long",
            projectedDays: validation.projectedDays,
            projectedYears: validation.projectedYears,
            suggestedIntervalDays: validation.suggestedIntervalDays,
            stepCount: course.total_modules,
          },
          { status: 422 }
        );
      }
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (action === "enroll") {
      updateData.commitment_interval_days = intervalDays;
    } else {
      updateData.commitment_interval_days = null;
    }

    const { error: updateError } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Enrollment update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update enrollment status" },
        { status: 500 }
      );
    }

    if (action === "enroll") {
      // Generate owner module schedules
      const { data: modules } = await supabase
        .from("modules")
        .select("id, module_index")
        .eq("course_id", id)
        .order("module_index", { ascending: true });

      if (modules && modules.length > 0) {
        const enrollmentDate = todayUTC();
        const schedule = generateModuleSchedule(
          modules,
          enrollmentDate,
          intervalDays
        );

        const scheduleRows = schedule.map((entry) => ({
          course_id: id,
          user_id: user.id,
          module_id: entry.moduleId,
          unlock_date: entry.unlockDate,
          due_date: entry.dueDate,
        }));

        const { error: scheduleError } = await supabase
          .from("owner_module_schedules")
          .insert(scheduleRows);

        if (scheduleError) {
          console.error("Owner schedule creation error:", scheduleError);
        }
      }
    } else {
      // Unenroll: delete owner schedules
      await supabase
        .from("owner_module_schedules")
        .delete()
        .eq("course_id", id)
        .eq("user_id", user.id);
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

import { jsonResponse, handleOptions } from "../../../lib/cors";
import { withAuthParams } from "../../../lib/withAuth";
import {
  generateModuleSchedule,
  todayUTC,
  validateCommitment,
  DEFAULT_COMMITMENT_INTERVAL_DAYS,
  ERROR_MESSAGES,
} from "@learn-anything/shared";

export const DELETE = withAuthParams<{ id: string }>(
  async (_request, { user, supabase, params }) => {
    const { id } = params;

    // Check if the user is the course owner
    const { data: course } = await supabase
      .from("courses")
      .select("id, user_id, status")
      .eq("id", id)
      .single();

    if (!course) {
      return jsonResponse(
        { success: false, error: ERROR_MESSAGES.COURSE_NOT_FOUND_404 },
        { status: 404 },
        _request
      );
    }

    const isOwner = course.user_id === user.id;

    if (isOwner) {
      // Owner unenroll: change course status back to 'created'
      if (course.status === "created") {
        return jsonResponse(
          { success: true, already_unenrolled: true },
          { status: 200 },
          _request
        );
      }

      const { error: updateError } = await supabase
        .from("courses")
        .update({ status: "created", commitment_interval_days: null })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Owner unenroll error:", updateError);
        return jsonResponse(
          { success: false, error: ERROR_MESSAGES.UNENROLL_FAILED_500 },
          { status: 500 },
          _request
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
        return jsonResponse(
          { success: true, already_unenrolled: true },
          { status: 200 },
          _request
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
        return jsonResponse(
          { success: false, error: ERROR_MESSAGES.UNENROLL_FAILED_500 },
          { status: 500 },
          _request
        );
      }
    }

    return jsonResponse({ success: true }, undefined, _request);
  }
);

export const POST = withAuthParams<{ id: string }>(
  async (request, { user, supabase, params }) => {
    const { id } = params;

    // Parse commitmentIntervalDays from request body
    let commitmentIntervalDays = DEFAULT_COMMITMENT_INTERVAL_DAYS;
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
      return jsonResponse(
        { success: false, error: ERROR_MESSAGES.COURSE_NOT_FOUND_404 },
        { status: 404 },
        request
      );
    }

    // Validate commitment duration (must fit within 1 year)
    const validation = validateCommitment(
      course.total_modules,
      commitmentIntervalDays
    );
    if (!validation.valid) {
      return jsonResponse(
        {
          success: false,
          error: ERROR_MESSAGES.COMMITMENT_TOO_LONG,
          projectedDays: validation.projectedDays,
          projectedYears: validation.projectedYears,
          suggestedIntervalDays: validation.suggestedIntervalDays,
          stepCount: course.total_modules,
        },
        { status: 422 },
        request
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
      return jsonResponse(
        { success: true, already_enrolled: true },
        { status: 200 },
        request
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
      return jsonResponse(
        { success: false, error: ERROR_MESSAGES.ENROLL_FAILED_500 },
        { status: 500 },
        request
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

    return jsonResponse({ success: true }, undefined, request);
  }
);

export const PATCH = withAuthParams<{ id: string }>(
  async (request, { user, supabase, params }) => {
    const { id } = params;

    const body = await request.json();
    const { action, commitmentIntervalDays } = body;

    if (action !== "enroll" && action !== "unenroll") {
      return jsonResponse(
        { success: false, error: ERROR_MESSAGES.INVALID_ENROLL_ACTION },
        { status: 400 },
        request
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
      return jsonResponse(
        { success: false, error: ERROR_MESSAGES.COURSE_NOT_FOUND_404 },
        { status: 404 },
        request
      );
    }

    const newStatus = action === "enroll" ? "started" : "created";

    // Guard against redundant status changes
    if (course.status === newStatus) {
      return jsonResponse(
        {
          success: false,
          error:
            action === "enroll"
              ? ERROR_MESSAGES.ALREADY_STARTED
              : ERROR_MESSAGES.ALREADY_UNENROLLED,
        },
        { status: 409 },
        request
      );
    }

    const intervalDays =
      typeof commitmentIntervalDays === "number" && commitmentIntervalDays >= 1
        ? commitmentIntervalDays
        : DEFAULT_COMMITMENT_INTERVAL_DAYS;

    // Validate commitment duration for enrollment (must fit within 1 year)
    if (action === "enroll") {
      const validation = validateCommitment(course.total_modules, intervalDays);
      if (!validation.valid) {
        return jsonResponse(
          {
            success: false,
            error: ERROR_MESSAGES.COMMITMENT_TOO_LONG,
            projectedDays: validation.projectedDays,
            projectedYears: validation.projectedYears,
            suggestedIntervalDays: validation.suggestedIntervalDays,
            stepCount: course.total_modules,
          },
          { status: 422 },
          request
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
      return jsonResponse(
        { success: false, error: ERROR_MESSAGES.ENROLLMENT_UPDATE_FAILED },
        { status: 500 },
        request
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

    return jsonResponse({ success: true, status: newStatus }, undefined, request);
  }
);

export { handleOptions as OPTIONS };

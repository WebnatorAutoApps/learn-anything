import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getSupabaseClient } from "../supabase";
import { callGemini } from "../llm/client";
import {
  generateModuleSchedule,
  todayUTC,
  validateCommitment,
} from "../schedule";
import { DEFAULT_COMMITMENT_INTERVAL_DAYS } from "../constants/validation";
import { LIKELIHOOD_THRESHOLD } from "../constants/llm";
import { ERROR_MESSAGES } from "../constants/errors";
import type { ThemeKey } from "../constants/themes";
import type { LearningRequest } from "../llm/types";

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planData,
      apiKey,
      tone,
    }: {
      planData: {
        whatToLearn: string;
        openDetail: string;
        currentExpertise: string;
        expertiseDetail: string;
        totalModules: number;
        commitmentDays: number;
        durationMonths: number;
      };
      apiKey: string;
      tone?: string | null;
    }) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      const request: LearningRequest = {
        learning_goal_short: planData.whatToLearn,
        learning_goal_long: planData.openDetail,
        expertise_level: planData.currentExpertise,
        expertise_details: planData.expertiseDetail || "",
        number_of_modules: planData.totalModules,
        commitment_interval_days: planData.commitmentDays,
        duration_months: planData.durationMonths,
        tone,
      };

      const llmResponse = await callGemini(apiKey, request);

      // Check likelihood threshold
      if (llmResponse.likelihood_of_learning < LIKELIHOOD_THRESHOLD) {
        return {
          success: false as const,
          low_likelihood: true,
          likelihood_of_learning: llmResponse.likelihood_of_learning,
          normalized_title: llmResponse.normalized_title,
          error: `${ERROR_MESSAGES.LOW_LIKELIHOOD_WARNING} (${llmResponse.likelihood_of_learning}%). The AI determined that meaningful progress through small practical projects is unlikely for this goal. Consider refining your learning goal, adjusting the scope, or choosing a more project-oriented skill.`,
        };
      }

      // Insert course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .insert({
          user_id: user.id,
          normalized_title: llmResponse.normalized_title,
          learning_goal: planData.whatToLearn,
          learning_goal_details: planData.openDetail,
          expertise_level: planData.currentExpertise,
          expertise_details: planData.expertiseDetail || null,
          expected_skill_level: llmResponse.expected_skill_level,
          likelihood_of_learning: llmResponse.likelihood_of_learning,
          total_modules: planData.totalModules,
          status: "created",
        })
        .select("id")
        .single();

      if (courseError || !course) {
        console.error("Course insert error:", courseError);
        throw new Error(ERROR_MESSAGES.COURSE_INSERT_FAILED);
      }

      // Insert modules
      const modulesData = llmResponse.program.map((mod) => ({
        course_id: course.id,
        module_index: mod.module_index,
        title: mod.module_title,
        description: mod.module_description,
      }));

      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .insert(modulesData)
        .select("id, module_index");

      if (modulesError || !modules) {
        console.error("Modules insert error:", modulesError);
        await supabase.from("courses").delete().eq("id", course.id);
        throw new Error(ERROR_MESSAGES.MODULES_INSERT_FAILED);
      }

      // Build module_index -> module id map
      const moduleIdMap = new Map<number, string>();
      for (const mod of modules) {
        moduleIdMap.set(mod.module_index, mod.id);
      }

      // Insert projects
      const projectsData = llmResponse.program.flatMap((mod) =>
        mod.projects.map((proj, projIdx) => ({
          module_id: moduleIdMap.get(mod.module_index)!,
          project_index: projIdx + 1,
          title: proj.project_title,
          instructions: proj.instructions,
          objective: proj.objective,
        }))
      );

      const { error: projectsError } = await supabase
        .from("projects")
        .insert(projectsData);

      if (projectsError) {
        console.error("Projects insert error:", projectsError);
        await supabase.from("courses").delete().eq("id", course.id);
        throw new Error(ERROR_MESSAGES.PROJECTS_INSERT_FAILED);
      }

      return {
        success: true as const,
        course: {
          id: course.id,
          normalized_title: llmResponse.normalized_title,
          expected_skill_level: llmResponse.expected_skill_level,
          likelihood_of_learning: llmResponse.likelihood_of_learning,
          total_modules: planData.totalModules,
        },
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coursesAll });
    },
  });
}

export function useGenerateCourse() {
  return useMutation({
    mutationFn: async ({
      planData,
      apiKey,
      tone,
      locale,
    }: {
      planData: {
        whatToLearn: string;
        openDetail: string;
        currentExpertise: string;
        expertiseDetail: string;
        totalModules: number;
        commitmentDays: number;
        durationMonths: number;
      };
      apiKey: string;
      tone?: string | null;
      locale?: string | null;
    }) => {
      const request: LearningRequest = {
        learning_goal_short: planData.whatToLearn,
        learning_goal_long: planData.openDetail,
        expertise_level: planData.currentExpertise,
        expertise_details: planData.expertiseDetail || "",
        number_of_modules: planData.totalModules,
        commitment_interval_days: planData.commitmentDays,
        duration_months: planData.durationMonths,
        tone,
        locale,
      };

      const llmResponse = await callGemini(apiKey, request);

      if (llmResponse.likelihood_of_learning < LIKELIHOOD_THRESHOLD) {
        return {
          success: false as const,
          low_likelihood: true,
          likelihood_of_learning: llmResponse.likelihood_of_learning,
          normalized_title: llmResponse.normalized_title,
          error: `${ERROR_MESSAGES.LOW_LIKELIHOOD_WARNING} (${llmResponse.likelihood_of_learning}%). The AI determined that meaningful progress through small practical projects is unlikely for this goal. Consider refining your learning goal, adjusting the scope, or choosing a more project-oriented skill.`,
        };
      }

      return {
        success: true as const,
        llmResponse,
      };
    },
  });
}

export function useSaveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planData,
      llmResponse,
    }: {
      planData: {
        whatToLearn: string;
        openDetail: string;
        currentExpertise: string;
        expertiseDetail: string;
        totalModules: number;
      };
      llmResponse: {
        normalized_title: string;
        expected_skill_level: string;
        likelihood_of_learning: number;
        program: {
          module_index: number;
          module_title: string;
          module_description: string;
          projects: {
            project_title: string;
            instructions: string;
            objective: string;
          }[];
        }[];
      };
    }) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      // Insert course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .insert({
          user_id: user.id,
          normalized_title: llmResponse.normalized_title,
          learning_goal: planData.whatToLearn,
          learning_goal_details: planData.openDetail,
          expertise_level: planData.currentExpertise,
          expertise_details: planData.expertiseDetail || null,
          expected_skill_level: llmResponse.expected_skill_level,
          likelihood_of_learning: llmResponse.likelihood_of_learning,
          total_modules: planData.totalModules,
          status: "created",
        })
        .select("id")
        .single();

      if (courseError || !course) {
        console.error("Course insert error:", courseError);
        throw new Error(ERROR_MESSAGES.COURSE_SAVE_FAILED);
      }

      // Insert modules
      const modulesData = llmResponse.program.map((mod) => ({
        course_id: course.id,
        module_index: mod.module_index,
        title: mod.module_title,
        description: mod.module_description,
      }));

      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .insert(modulesData)
        .select("id, module_index");

      if (modulesError || !modules) {
        console.error("Modules insert error:", modulesError);
        await supabase.from("courses").delete().eq("id", course.id);
        throw new Error(ERROR_MESSAGES.MODULES_INSERT_FAILED);
      }

      // Build module_index -> module id map
      const moduleIdMap = new Map<number, string>();
      for (const mod of modules) {
        moduleIdMap.set(mod.module_index, mod.id);
      }

      // Insert projects
      const projectsData = llmResponse.program.flatMap((mod) =>
        mod.projects.map((proj, projIdx) => ({
          module_id: moduleIdMap.get(mod.module_index)!,
          project_index: projIdx + 1,
          title: proj.project_title,
          instructions: proj.instructions,
          objective: proj.objective,
        }))
      );

      const { error: projectsError } = await supabase
        .from("projects")
        .insert(projectsData);

      if (projectsError) {
        console.error("Projects insert error:", projectsError);
        await supabase.from("courses").delete().eq("id", course.id);
        throw new Error(ERROR_MESSAGES.PROJECTS_INSERT_FAILED);
      }

      return {
        success: true as const,
        course: {
          id: course.id,
          normalized_title: llmResponse.normalized_title,
          expected_skill_level: llmResponse.expected_skill_level,
          likelihood_of_learning: llmResponse.likelihood_of_learning,
          total_modules: planData.totalModules,
        },
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coursesAll });
    },
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      isOwner,
      commitmentIntervalDays,
    }: {
      courseId: string;
      isOwner: boolean;
      commitmentIntervalDays?: number;
    }) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      const intervalDays =
        typeof commitmentIntervalDays === "number" && commitmentIntervalDays >= 1
          ? commitmentIntervalDays
          : DEFAULT_COMMITMENT_INTERVAL_DAYS;

      if (isOwner) {
        // Owner enrollment via PATCH logic
        const { data: course, error: courseError } = await supabase
          .from("courses")
          .select("id, status, total_modules")
          .eq("id", courseId)
          .eq("user_id", user.id)
          .single();

        if (courseError || !course) {
          throw new Error(ERROR_MESSAGES.COURSE_NOT_FOUND_404);
        }

        if (course.status === "started") {
          return { success: true, already_enrolled: true };
        }

        // Validate commitment
        const validation = validateCommitment(course.total_modules, intervalDays);
        if (!validation.valid) {
          const err = new Error(ERROR_MESSAGES.COMMITMENT_TOO_LONG);
          (err as Error & { projectedDays?: number; suggestedIntervalDays?: number | null }).projectedDays = validation.projectedDays;
          (err as Error & { suggestedIntervalDays?: number | null }).suggestedIntervalDays = validation.suggestedIntervalDays;
          throw err;
        }

        const { error: updateError } = await supabase
          .from("courses")
          .update({ status: "started", commitment_interval_days: intervalDays })
          .eq("id", courseId)
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Owner enroll error:", updateError);
          throw new Error(ERROR_MESSAGES.ENROLLMENT_UPDATE_FAILED);
        }

        // Generate owner module schedules
        const { data: modules } = await supabase
          .from("modules")
          .select("id, module_index")
          .eq("course_id", courseId)
          .order("module_index", { ascending: true });

        if (modules && modules.length > 0) {
          const enrollmentDate = todayUTC();
          const schedule = generateModuleSchedule(modules, enrollmentDate, intervalDays);

          const scheduleRows = schedule.map((entry) => ({
            course_id: courseId,
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

        return { success: true, status: "started" };
      }

      // Non-owner enrollment via POST logic
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, total_modules")
        .eq("id", courseId)
        .single();

      if (courseError || !course) {
        throw new Error(ERROR_MESSAGES.COURSE_NOT_FOUND_404);
      }

      const validation = validateCommitment(course.total_modules, intervalDays);
      if (!validation.valid) {
        const err = new Error(ERROR_MESSAGES.COMMITMENT_TOO_LONG);
        (err as Error & { projectedDays?: number; suggestedIntervalDays?: number | null }).projectedDays = validation.projectedDays;
        (err as Error & { suggestedIntervalDays?: number | null }).suggestedIntervalDays = validation.suggestedIntervalDays;
        throw err;
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();

      if (existing) {
        return { success: true, already_enrolled: true };
      }

      const { data: enrollment, error: enrollError } = await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
          commitment_interval_days: intervalDays,
        })
        .select("id")
        .single();

      if (enrollError || !enrollment) {
        console.error("Enrollment error:", enrollError);
        throw new Error(ERROR_MESSAGES.ENROLL_FAILED_500);
      }

      // Generate module schedules
      const { data: modules } = await supabase
        .from("modules")
        .select("id, module_index")
        .eq("course_id", courseId)
        .order("module_index", { ascending: true });

      if (modules && modules.length > 0) {
        const enrollmentDate = todayUTC();
        const schedule = generateModuleSchedule(modules, enrollmentDate, intervalDays);

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
        }
      }

      return { success: true };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.course(variables.courseId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.coursesAll });
    },
  });
}

export function useUnenrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      const { data: course } = await supabase
        .from("courses")
        .select("id, user_id, status")
        .eq("id", courseId)
        .single();

      if (!course) {
        throw new Error(ERROR_MESSAGES.COURSE_NOT_FOUND_404);
      }

      const isOwner = course.user_id === user.id;

      if (isOwner) {
        if (course.status === "created") {
          return { success: true, already_unenrolled: true };
        }

        const { error: updateError } = await supabase
          .from("courses")
          .update({ status: "created", commitment_interval_days: null })
          .eq("id", courseId)
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Owner unenroll error:", updateError);
          throw new Error(ERROR_MESSAGES.UNENROLL_FAILED_500);
        }

        await supabase
          .from("owner_module_schedules")
          .delete()
          .eq("course_id", courseId)
          .eq("user_id", user.id);
      } else {
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .single();

        if (!enrollment) {
          return { success: true, already_unenrolled: true };
        }

        await supabase
          .from("module_schedules")
          .delete()
          .eq("enrollment_id", enrollment.id);

        const { error: deleteError } = await supabase
          .from("enrollments")
          .delete()
          .eq("user_id", user.id)
          .eq("course_id", courseId);

        if (deleteError) {
          console.error("Enrollment delete error:", deleteError);
          throw new Error(ERROR_MESSAGES.UNENROLL_FAILED_500);
        }
      }

      return { success: true };
    },
    onSuccess: (_data, courseId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.course(courseId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.coursesAll });
    },
  });
}

export function useSaveTone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tone: string) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      const { error } = await supabase
        .from("profiles")
        .update({ tone: tone || null })
        .eq("id", user.id);

      if (error) throw new Error(ERROR_MESSAGES.TONE_UPDATE_FAILED);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useSaveTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: ThemeKey) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      const { error } = await supabase
        .from("profiles")
        .update({ theme })
        .eq("id", user.id);

      if (error) throw new Error(ERROR_MESSAGES.THEME_UPDATE_FAILED);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useSelectProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
      projectId,
    }: {
      courseId: string;
      moduleId: string;
      projectId: string;
    }) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      // Verify module belongs to course
      const { data: mod, error: modError } = await supabase
        .from("modules")
        .select("id")
        .eq("id", moduleId)
        .eq("course_id", courseId)
        .single();

      if (modError || !mod) {
        throw new Error(ERROR_MESSAGES.MODULE_NOT_FOUND);
      }

      // Verify project belongs to module
      const { data: project, error: projError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("module_id", moduleId)
        .single();

      if (projError || !project) {
        throw new Error(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }

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
        throw new Error(ERROR_MESSAGES.PROJECT_SELECT_FAILED);
      }

      return { success: true };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.course(variables.courseId),
      });
    },
  });
}

export function useCompleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
      comment,
      imageUrl,
    }: {
      courseId: string;
      moduleId: string;
      comment?: string;
      imageUrl?: string;
    }) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      // Find user's selected project for this module
      const { data: selection, error: selError } = await supabase
        .from("user_module_projects")
        .select("id, completed")
        .eq("user_id", user.id)
        .eq("module_id", moduleId)
        .single();

      if (selError || !selection) {
        throw new Error(ERROR_MESSAGES.NO_PROJECT_SELECTED);
      }

      if (selection.completed) {
        return { success: true, already_completed: true };
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
        throw new Error(ERROR_MESSAGES.PROJECT_COMPLETE_FAILED);
      }

      return { success: true };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.course(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.upcomingProjects,
      });
    },
  });
}

export function useUploadCompletionImage() {
  return useMutation({
    mutationFn: async (file: Blob) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      const ext = file.type.split("/")[1] || "jpg";
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).slice(2, 8);
      const filePath = `${user.id}/${timestamp}-${randomSuffix}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("completion-images")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
      }

      const { data: urlData } = supabase.storage
        .from("completion-images")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { full_name: string }) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: data.full_name })
        .eq("id", user.id);

      if (error) throw new Error(ERROR_MESSAGES.PROFILE_UPDATE_FAILED);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: Blob) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      const ext = file.type.split("/")[1] || "jpg";
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        throw new Error(ERROR_MESSAGES.AVATAR_UPLOAD_FAILED);
      }

      const { data: urlData } = supabase.storage
        .from("profile-avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);

      if (updateError) {
        console.error("Profile avatar update error:", updateError);
        throw new Error(ERROR_MESSAGES.AVATAR_PROFILE_UPDATE_FAILED);
      }

      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useUpdateEmail() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const supabase = getSupabaseClient();

      const { error } = await supabase.auth.updateUser({
        email: data.email,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: "A confirmation email has been sent to your new address.",
      };
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: {
      current_password: string;
      new_password: string;
    }) => {
      const supabase = getSupabaseClient();

      // Verify current password
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.current_password,
      });

      if (verifyError) {
        throw new Error(ERROR_MESSAGES.PASSWORD_INCORRECT);
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.new_password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      return { success: true };
    },
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { username: string }) => {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ERROR_MESSAGES.NOT_AUTHENTICATED);

      const username = data.username.trim().toLowerCase();

      // Check if same username
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile?.username === username) {
        return { success: true, username };
      }

      // Check uniqueness (case-insensitive)
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", username)
        .neq("id", user.id)
        .maybeSingle();

      if (existing) {
        throw new Error(ERROR_MESSAGES.USERNAME_TAKEN);
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

      if (updateError) {
        if (updateError.code === "23505") {
          throw new Error(ERROR_MESSAGES.USERNAME_TAKEN);
        }
        throw new Error(ERROR_MESSAGES.USERNAME_UPDATE_FAILED);
      }

      return { success: true, username };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

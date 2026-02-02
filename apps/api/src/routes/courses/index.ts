import { jsonResponse, handleOptions } from "../../lib/cors";
import { withAuth } from "../../lib/withAuth";
import { createLLMProvider } from "../../lib/llm";
import { decrypt } from "../../lib/crypto";
import { createRateLimiter } from "../../lib/rateLimit";
import { ERROR_MESSAGES, LIKELIHOOD_THRESHOLD } from "@learn-anything/shared";

const courseCreationLimiter = createRateLimiter(10, 3_600_000); // 10 req/user/hour

export const POST = withAuth(async (request, { user, supabase }) => {
  const { allowed, retryAfterMs } = courseCreationLimiter(user.id);

  if (!allowed) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.RATE_LIMIT_COURSE_CREATION },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      },
      request
    );
  }
  const body = await request.json();
  const {
    whatToLearn,
    openDetail,
    currentExpertise,
    expertiseDetail,
    totalModules,
  } = body;

  if (!whatToLearn || !openDetail || !currentExpertise || !totalModules) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS },
      { status: 400 },
      request
    );
  }

  // Fetch the user's encrypted Gemini API key and tone preference from their profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("encrypted_api_key, tone")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.encrypted_api_key) {
    return jsonResponse(
      {
        success: false,
        error: ERROR_MESSAGES.NO_API_KEY,
      },
      { status: 400 },
      request
    );
  }

  // Decrypt the key server-side only for the Gemini API call
  let apiKey: string;
  try {
    apiKey = decrypt(profile.encrypted_api_key);
  } catch (decryptError) {
    console.error("Decryption error:", decryptError);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.DECRYPT_FAILED },
      { status: 500 },
      request
    );
  }

  // Call Gemini via the LLM provider abstraction
  const provider = createLLMProvider("gemini", apiKey);

  const llmResponse = await provider.generateCourse({
    learning_goal_short: whatToLearn,
    learning_goal_long: openDetail,
    expertise_level: currentExpertise,
    expertise_details: expertiseDetail || "",
    number_of_modules: totalModules,
    tone: profile.tone,
  });

  // Check likelihood threshold — don't store courses unlikely to succeed
  if (llmResponse.likelihood_of_learning < LIKELIHOOD_THRESHOLD) {
    return jsonResponse({
      success: false,
      low_likelihood: true,
      likelihood_of_learning: llmResponse.likelihood_of_learning,
      normalized_title: llmResponse.normalized_title,
      error: `This learning goal has a low likelihood of success (${llmResponse.likelihood_of_learning}%). The AI determined that meaningful progress through small practical projects is unlikely for this goal. Consider refining your learning goal, adjusting the scope, or choosing a more project-oriented skill.`,
    }, undefined, request);
  }

  // Store course in database with 'created' enrollment status
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .insert({
      user_id: user.id,
      normalized_title: llmResponse.normalized_title,
      learning_goal: whatToLearn,
      learning_goal_details: openDetail,
      expertise_level: currentExpertise,
      expertise_details: expertiseDetail || null,
      expected_skill_level: llmResponse.expected_skill_level,
      likelihood_of_learning: llmResponse.likelihood_of_learning,
      total_modules: totalModules,
      status: "created",
    })
    .select("id")
    .single();

  if (courseError || !course) {
    console.error("Course insert error:", courseError);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.COURSE_INSERT_FAILED },
      { status: 500 },
      request
    );
  }

  // Insert all modules
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
    // Clean up the course since modules failed
    await supabase.from("courses").delete().eq("id", course.id);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.MODULES_INSERT_FAILED },
      { status: 500 },
      request
    );
  }

  // Build a map of module_index -> module id for project insertion
  const moduleIdMap = new Map<number, string>();
  for (const mod of modules) {
    moduleIdMap.set(mod.module_index, mod.id);
  }

  // Insert all projects
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
    // Clean up the course (cascade will remove modules and projects)
    await supabase.from("courses").delete().eq("id", course.id);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.PROJECTS_INSERT_FAILED },
      { status: 500 },
      request
    );
  }

  return jsonResponse({
    success: true,
    course: {
      id: course.id,
      normalized_title: llmResponse.normalized_title,
      expected_skill_level: llmResponse.expected_skill_level,
      likelihood_of_learning: llmResponse.likelihood_of_learning,
      total_modules: totalModules,
    },
  }, undefined, request);
});

export const GET = withAuth(async (request, { user, supabase }) => {
  // Optional status filter: ?status=created, ?status=started, or ?status=all
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  let query = supabase
    .from("courses")
    .select("id, normalized_title, expected_skill_level, likelihood_of_learning, total_modules, status, created_at")
    .eq("user_id", user.id);

  if (statusFilter === "created" || statusFilter === "started") {
    query = query.eq("status", statusFilter);
  }

  const { data: courses, error: coursesError } = await query.order("created_at", { ascending: false });

  if (coursesError) {
    console.error("Courses fetch error:", coursesError);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.COURSES_FETCH_FAILED },
      { status: 500 },
      request
    );
  }

  // When fetching all courses, include isEnrolled flag per course
  const coursesWithEnrollment = (courses || []).map((course) => ({
    ...course,
    isEnrolled: course.status === "started",
  }));

  return jsonResponse({ success: true, courses: coursesWithEnrollment }, undefined, request);
});

export { handleOptions as OPTIONS };

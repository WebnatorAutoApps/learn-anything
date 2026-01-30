import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLLMProvider, LIKELIHOOD_THRESHOLD } from "@/lib/llm";

export async function POST(request: Request) {
  try {
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
    const {
      whatToLearn,
      openDetail,
      currentExpertise,
      expertiseDetail,
      totalModules,
    } = body;

    if (!whatToLearn || !openDetail || !currentExpertise || !totalModules) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch the user's Gemini API key from their profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("gemini_api_key")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.gemini_api_key) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No Gemini API key found. Please add your API key in Settings.",
        },
        { status: 400 }
      );
    }

    // Call Gemini via the LLM provider abstraction
    const provider = createLLMProvider("gemini", profile.gemini_api_key);

    const llmResponse = await provider.generateCourse({
      learning_goal_short: whatToLearn,
      learning_goal_long: openDetail,
      expertise_level: currentExpertise,
      expertise_details: expertiseDetail || "",
      number_of_modules: totalModules,
    });

    // Check likelihood threshold — don't store courses unlikely to succeed
    if (llmResponse.likelihood_of_learning < LIKELIHOOD_THRESHOLD) {
      return NextResponse.json({
        success: false,
        low_likelihood: true,
        likelihood_of_learning: llmResponse.likelihood_of_learning,
        normalized_title: llmResponse.normalized_title,
        error: `This learning goal has a low likelihood of success (${llmResponse.likelihood_of_learning}%). The AI determined that meaningful progress through small practical projects is unlikely for this goal. Consider refining your learning goal, adjusting the scope, or choosing a more project-oriented skill.`,
      });
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
      return NextResponse.json(
        { success: false, error: "Failed to create course" },
        { status: 500 }
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
      return NextResponse.json(
        { success: false, error: "Failed to create modules" },
        { status: 500 }
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
      return NextResponse.json(
        { success: false, error: "Failed to create projects" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        normalized_title: llmResponse.normalized_title,
        expected_skill_level: llmResponse.expected_skill_level,
        likelihood_of_learning: llmResponse.likelihood_of_learning,
        total_modules: totalModules,
      },
    });
  } catch (error) {
    console.error("Course creation error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
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

    // Optional status filter: ?status=created or ?status=started
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
      return NextResponse.json(
        { success: false, error: "Failed to fetch courses" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, courses: courses || [] });
  } catch (error) {
    console.error("Courses fetch error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

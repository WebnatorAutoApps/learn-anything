import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMockResponse } from "@/lib/gemini/mock";

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

    // Call mock Gemini service (will be replaced with real API later)
    const geminiResponse = generateMockResponse({
      learning_goal_short: whatToLearn,
      learning_goal_long: openDetail,
      expertise_level: currentExpertise,
      expertise_details: expertiseDetail || "",
      number_of_modules: totalModules,
    });

    // Store course in database
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        user_id: user.id,
        normalized_title: geminiResponse.normalized_title,
        learning_goal: whatToLearn,
        learning_goal_details: openDetail,
        expertise_level: currentExpertise,
        expertise_details: expertiseDetail || null,
        expected_skill_level: geminiResponse.expected_skill_level,
        likelihood_of_learning: geminiResponse.likelihood_of_learning,
        total_modules: totalModules,
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
    const modulesData = geminiResponse.program.map((mod) => ({
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
    const projectsData = geminiResponse.program.flatMap((mod) =>
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
        normalized_title: geminiResponse.normalized_title,
        expected_skill_level: geminiResponse.expected_skill_level,
        likelihood_of_learning: geminiResponse.likelihood_of_learning,
        total_modules: totalModules,
      },
    });
  } catch (error) {
    console.error("Course creation error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET() {
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

    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, normalized_title, expected_skill_level, likelihood_of_learning, total_modules, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

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

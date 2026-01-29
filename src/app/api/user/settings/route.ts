import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
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
    const { gemini_api_key } = body;

    if (gemini_api_key !== undefined && typeof gemini_api_key !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid API key format" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ gemini_api_key: gemini_api_key ?? null })
      .eq("id", user.id);

    if (updateError) {
      console.error("Settings update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

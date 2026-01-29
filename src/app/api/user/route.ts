import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, gemini_api_key, created_at, updated_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Fall back to auth metadata for avatar if not in profile
    const avatarUrl =
      profile.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null;

    // Mask the API key before returning — only show last 4 characters
    const maskedProfile = {
      ...profile,
      avatar_url: avatarUrl,
      gemini_api_key: profile.gemini_api_key
        ? "••••••••" + profile.gemini_api_key.slice(-4)
        : null,
      has_gemini_api_key: !!profile.gemini_api_key,
    };

    return NextResponse.json({ success: true, profile: maskedProfile });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

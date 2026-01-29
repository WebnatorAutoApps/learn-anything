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

    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, gemini_api_key, created_at, updated_at")
      .eq("id", user.id)
      .single();

    // If profile doesn't exist, create it from auth user metadata.
    // This handles cases where the handle_new_user trigger didn't fire
    // (e.g., user created before trigger existed, or trigger failed).
    if (profileError && profileError.code === "PGRST116") {
      const meta = user.user_metadata ?? {};
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: meta.full_name || meta.name || null,
          email: user.email || null,
          avatar_url: meta.avatar_url || meta.picture || null,
        })
        .select("id, full_name, email, avatar_url, gemini_api_key, created_at, updated_at")
        .single();

      if (insertError) {
        console.error("Profile auto-create failed:", insertError);
        return NextResponse.json(
          { success: false, error: "Profile not found" },
          { status: 404 }
        );
      }

      profile = newProfile;
      profileError = null;
    }

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
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

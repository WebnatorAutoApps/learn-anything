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

    const profileSelect = "id, full_name, email, avatar_url, gemini_api_key, created_at, updated_at";
    const meta = user.user_metadata ?? {};

    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(profileSelect)
      .eq("id", user.id)
      .single();

    // If profile doesn't exist, create it from auth user metadata.
    // This handles cases where the handle_new_user trigger didn't fire
    // (e.g., user created before trigger existed, or trigger failed).
    if (profileError && profileError.code === "PGRST116") {
      const { data: newProfile, error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: meta.full_name || meta.name || null,
          email: user.email || null,
          avatar_url: meta.avatar_url || meta.picture || null,
        })
        .select(profileSelect)
        .single();

      if (!upsertError && newProfile) {
        profile = newProfile;
        profileError = null;
      } else {
        console.error("Profile auto-create failed:", upsertError);
      }
    } else if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    // If we still don't have a profile (DB down, RLS issue, etc.),
    // return auth metadata so the frontend isn't left with nothing.
    if (!profile) {
      return NextResponse.json({
        success: true,
        profile: {
          id: user.id,
          full_name: meta.full_name || meta.name || null,
          email: user.email || null,
          avatar_url: meta.avatar_url || meta.picture || null,
          gemini_api_key: null,
          has_gemini_api_key: false,
          created_at: null,
          updated_at: null,
        },
      });
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

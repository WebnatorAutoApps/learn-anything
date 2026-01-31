import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateUsername } from "@/lib/username";

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

    // Only select non-sensitive columns — encrypted_api_key is never fetched
    const profileSelect = "id, full_name, email, avatar_url, api_key_last4, username, created_at, updated_at";
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
      const fullName = meta.full_name || meta.name || null;
      const username = await generateUniqueUsername(supabase, fullName);

      const { data: newProfile, error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          email: user.email || null,
          avatar_url: meta.avatar_url || meta.picture || null,
          username,
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
          api_key_last4: null,
          has_gemini_api_key: false,
          username: null,
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

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        avatar_url: avatarUrl,
        has_gemini_api_key: !!profile.api_key_last4,
      },
    });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * Generate a unique username with retry logic.
 * Checks for existence in the database and retries on collision.
 */
async function generateUniqueUsername(
  supabase: Awaited<ReturnType<typeof createClient>>,
  fullName: string | null
): Promise<string> {
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const candidate = generateUsername(fullName);

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();

    if (!existing) {
      return candidate;
    }

    console.warn(
      `Username collision: "${candidate}" already exists (attempt ${attempt}/${maxAttempts})`
    );
  }

  throw new Error(
    `Failed to generate unique username after ${maxAttempts} attempts`
  );
}

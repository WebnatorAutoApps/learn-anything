import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Username format rules (must match the DB check constraint):
 * - Only lowercase letters, digits, and hyphens
 * - Between 3 and 39 characters
 * - Cannot start or end with a hyphen
 * - No consecutive hyphens
 */
const USERNAME_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 39;

function validateUsername(username: string): string | null {
  if (username.length < USERNAME_MIN_LENGTH) {
    return `Username must be at least ${USERNAME_MIN_LENGTH} characters.`;
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return `Username must be ${USERNAME_MAX_LENGTH} characters or less.`;
  }
  if (!USERNAME_REGEX.test(username)) {
    return "Username can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.";
  }
  if (username.includes("--")) {
    return "Username cannot contain consecutive hyphens.";
  }
  return null;
}

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
    const { username } = body;

    if (typeof username !== "string") {
      return NextResponse.json(
        { success: false, error: "Username is required." },
        { status: 400 }
      );
    }

    const trimmed = username.trim().toLowerCase();

    if (!trimmed) {
      return NextResponse.json(
        { success: false, error: "Username cannot be empty." },
        { status: 400 }
      );
    }

    const formatError = validateUsername(trimmed);
    if (formatError) {
      return NextResponse.json(
        { success: false, error: formatError },
        { status: 422 }
      );
    }

    // Check if the user is trying to set the same username they already have
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (currentProfile && currentProfile.username?.toLowerCase() === trimmed) {
      return NextResponse.json({ success: true, username: currentProfile.username });
    }

    // Check case-insensitive uniqueness
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", trimmed)
      .neq("id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "This username is already in use." },
        { status: 409 }
      );
    }

    // Persist the change
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: trimmed })
      .eq("id", user.id);

    if (updateError) {
      // Handle race condition: another user claimed it between our check and update
      if (updateError.code === "23505") {
        return NextResponse.json(
          { success: false, error: "This username is already in use." },
          { status: 409 }
        );
      }
      console.error("Username update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update username." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, username: trimmed });
  } catch (error) {
    console.error("Username update error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

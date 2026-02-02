import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";
import { usernameSchema } from "@/lib/validation";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

export const PUT = withAuth(async (request, { user, supabase }) => {
  const body = await request.json();
  const { username } = body;

  if (typeof username !== "string") {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.USERNAME_REQUIRED },
      { status: 400 }
    );
  }

  const trimmed = username.trim().toLowerCase();

  if (!trimmed) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.USERNAME_EMPTY },
      { status: 400 }
    );
  }

  const result = usernameSchema.safeParse(trimmed);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.issues[0].message },
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
      { success: false, error: ERROR_MESSAGES.USERNAME_TAKEN },
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
        { success: false, error: ERROR_MESSAGES.USERNAME_TAKEN },
        { status: 409 }
      );
    }
    console.error("Username update error:", updateError);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.USERNAME_UPDATE_FAILED },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, username: trimmed });
});

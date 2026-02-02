import { jsonResponse, handleOptions } from "../../lib/cors";
import { withAuth } from "../../lib/withAuth";
import { usernameSchema, ERROR_MESSAGES } from "@learn-anything/shared";

export const PUT = withAuth(async (request, { user, supabase }) => {
  const body = await request.json();
  const { username } = body;

  if (typeof username !== "string") {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.USERNAME_REQUIRED },
      { status: 400 },
      request
    );
  }

  const trimmed = username.trim().toLowerCase();

  if (!trimmed) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.USERNAME_EMPTY },
      { status: 400 },
      request
    );
  }

  const result = usernameSchema.safeParse(trimmed);
  if (!result.success) {
    return jsonResponse(
      { success: false, error: result.error.issues[0].message },
      { status: 422 },
      request
    );
  }

  // Check if the user is trying to set the same username they already have
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (currentProfile && currentProfile.username?.toLowerCase() === trimmed) {
    return jsonResponse(
      { success: true, username: currentProfile.username },
      undefined,
      request
    );
  }

  // Check case-insensitive uniqueness
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", trimmed)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.USERNAME_TAKEN },
      { status: 409 },
      request
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
      return jsonResponse(
        { success: false, error: ERROR_MESSAGES.USERNAME_TAKEN },
        { status: 409 },
        request
      );
    }
    console.error("Username update error:", updateError);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.USERNAME_UPDATE_FAILED },
      { status: 500 },
      request
    );
  }

  return jsonResponse(
    { success: true, username: trimmed },
    undefined,
    request
  );
});

export { handleOptions as OPTIONS };

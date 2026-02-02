import { jsonResponse, handleOptions } from "../../lib/cors";
import { withAuth } from "../../lib/withAuth";
import { passwordSchema, ERROR_MESSAGES } from "@learn-anything/shared";

export const PUT = withAuth(async (request, { user, supabase }) => {
  // Block password change for OAuth users
  const provider = user.app_metadata?.provider;
  if (provider && provider !== "email") {
    return jsonResponse(
      {
        success: false,
        error: ERROR_MESSAGES.PASSWORD_OAUTH_BLOCKED,
      },
      { status: 403 },
      request
    );
  }

  const body = await request.json();
  const { current_password, new_password } = body;

  if (typeof current_password !== "string" || !current_password) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.PASSWORD_CURRENT_REQUIRED },
      { status: 400 },
      request
    );
  }

  if (typeof new_password !== "string" || !new_password) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.PASSWORD_NEW_REQUIRED },
      { status: 400 },
      request
    );
  }

  const result = passwordSchema.safeParse(new_password);
  if (!result.success) {
    return jsonResponse(
      { success: false, error: result.error.issues[0].message },
      { status: 400 },
      request
    );
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: current_password,
  });

  if (signInError) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.PASSWORD_INCORRECT },
      { status: 403 },
      request
    );
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: new_password,
  });

  if (updateError) {
    console.error("Password update error:", updateError);
    return jsonResponse(
      { success: false, error: updateError.message || ERROR_MESSAGES.PASSWORD_UPDATE_FAILED },
      { status: 500 },
      request
    );
  }

  return jsonResponse({ success: true }, undefined, request);
});

export { handleOptions as OPTIONS };

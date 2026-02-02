import { jsonResponse, handleOptions } from "../../lib/cors";
import { withAuth } from "../../lib/withAuth";
import { displayNameSchema, ERROR_MESSAGES } from "@learn-anything/shared";

export const PUT = withAuth(async (request, { user, supabase }) => {
  const body = await request.json();
  const { full_name } = body;

  if (typeof full_name !== "string") {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.DISPLAY_NAME_REQUIRED },
      { status: 400 },
      request
    );
  }

  const trimmedName = full_name.trim();
  const result = displayNameSchema.safeParse(trimmedName);

  if (!result.success) {
    return jsonResponse(
      { success: false, error: result.error.issues[0].message },
      { status: 400 },
      request
    );
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ full_name: trimmedName })
    .eq("id", user.id);

  if (updateError) {
    console.error("Profile update error:", updateError);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.PROFILE_UPDATE_FAILED },
      { status: 500 },
      request
    );
  }

  return jsonResponse({ success: true }, undefined, request);
});

export { handleOptions as OPTIONS };

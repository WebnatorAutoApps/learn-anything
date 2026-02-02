import { jsonResponse, handleOptions } from "../lib/cors";
import { withAuth } from "../lib/withAuth";
import { ERROR_MESSAGES } from "@learn-anything/shared";

export const POST = withAuth(async (request, { supabase }) => {
  try {
    await supabase.auth.signOut();

    return jsonResponse({ success: true }, undefined, request);
  } catch (error) {
    console.error("Logout error:", error);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.UNEXPECTED },
      { status: 500 },
      request
    );
  }
});

export { handleOptions as OPTIONS };

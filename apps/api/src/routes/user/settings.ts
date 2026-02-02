import { jsonResponse, handleOptions } from "../../lib/cors";
import { withAuth } from "../../lib/withAuth";
import { encrypt, extractLast4 } from "../../lib/crypto";
import { toneSchema, themeSchema, ERROR_MESSAGES } from "@learn-anything/shared";

export const PUT = withAuth(async (request, { user, supabase }) => {
  const body = await request.json();
  const { gemini_api_key, tone, theme } = body;

  // Username changes are handled by the dedicated /api/user/username endpoint
  if ("username" in body) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.USERNAME_USE_DEDICATED_ENDPOINT },
      { status: 400 },
      request
    );
  }

  if (gemini_api_key !== undefined && typeof gemini_api_key !== "string") {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.INVALID_API_KEY_FORMAT },
      { status: 400 },
      request
    );
  }

  if (tone !== undefined && typeof tone !== "string") {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.INVALID_TONE_FORMAT },
      { status: 400 },
      request
    );
  }

  if (typeof tone === "string" && tone.length > 0) {
    const toneResult = toneSchema.safeParse(tone);
    if (!toneResult.success) {
      return jsonResponse(
        { success: false, error: toneResult.error.issues[0].message },
        { status: 400 },
        request
      );
    }
  }

  // Build update data from provided fields
  const updateData: Record<string, string | null> = {};

  // Handle API key
  if (gemini_api_key !== undefined) {
    const keyValue = typeof gemini_api_key === "string" ? gemini_api_key.trim() : null;
    const isClearing = !keyValue;

    if (isClearing) {
      updateData.encrypted_api_key = null;
      updateData.api_key_last4 = null;
    } else {
      try {
        updateData.encrypted_api_key = encrypt(keyValue);
        updateData.api_key_last4 = extractLast4(keyValue);
      } catch (encryptError) {
        console.error("Encryption error:", encryptError);
        const detail =
          encryptError instanceof Error ? encryptError.message : undefined;
        return jsonResponse(
          {
            success: false,
            error: detail
              ? `Server configuration error: ${detail}`
              : ERROR_MESSAGES.ENCRYPT_FAILED,
          },
          { status: 500 },
          request
        );
      }
    }
  }

  // Handle tone
  if (tone !== undefined) {
    const trimmed = typeof tone === "string" ? tone.trim() : "";
    // Empty/whitespace-only tone clears the field (falls back to default in app)
    updateData.tone = trimmed || null;
  }

  // Handle theme
  if (theme !== undefined) {
    const themeResult = themeSchema.safeParse(theme);
    if (!themeResult.success) {
      return jsonResponse(
        { success: false, error: themeResult.error.issues[0].message },
        { status: 400 },
        request
      );
    }
    updateData.theme = theme;
  }

  // Nothing to update
  if (Object.keys(updateData).length === 0) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.NO_FIELDS_TO_UPDATE },
      { status: 400 },
      request
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select("id");

  if (updateError) {
    console.error("Settings update error:", updateError);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.SETTINGS_UPDATE_FAILED },
      { status: 500 },
      request
    );
  }

  // If no rows were updated, the profile doesn't exist yet
  if (!updated || updated.length === 0) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.PROFILE_NOT_FOUND },
      { status: 404 },
      request
    );
  }

  return jsonResponse(
    {
      success: true,
      ...(gemini_api_key !== undefined && {
        api_key_last4: !gemini_api_key?.trim() ? null : updateData.api_key_last4,
      }),
    },
    undefined,
    request
  );
});

export { handleOptions as OPTIONS };

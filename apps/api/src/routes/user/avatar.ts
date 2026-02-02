import { jsonResponse, handleOptions } from "../../lib/cors";
import { withAuth } from "../../lib/withAuth";
import { MAX_AVATAR_FILE_SIZE, ALLOWED_IMAGE_TYPES, ERROR_MESSAGES } from "@learn-anything/shared";

export const POST = withAuth(async (request, { user, supabase }) => {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.NO_FILE_PROVIDED },
      { status: 400 },
      request
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return jsonResponse(
      {
        success: false,
        error: ERROR_MESSAGES.FILE_INVALID_TYPE,
      },
      { status: 400 },
      request
    );
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    return jsonResponse(
      {
        success: false,
        error: ERROR_MESSAGES.AVATAR_FILE_TOO_LARGE,
      },
      { status: 400 },
      request
    );
  }

  // Use a fixed filename so new uploads overwrite the old one
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${user.id}/avatar.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("profile-avatars")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Avatar upload error:", uploadError);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.AVATAR_UPLOAD_FAILED },
      { status: 500 },
      request
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("profile-avatars")
    .getPublicUrl(filePath);

  // Add cache-bust parameter so browsers see the new image
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  // Update the profile with the new avatar URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) {
    console.error("Profile avatar_url update error:", updateError);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.AVATAR_UPLOAD_OK_PROFILE_FAILED },
      { status: 500 },
      request
    );
  }

  return jsonResponse(
    { success: true, avatar_url: avatarUrl },
    undefined,
    request
  );
});

export { handleOptions as OPTIONS };

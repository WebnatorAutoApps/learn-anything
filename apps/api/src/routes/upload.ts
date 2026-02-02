import { jsonResponse, handleOptions } from "../lib/cors";
import { withAuth } from "../lib/withAuth";
import {
  MAX_COMPLETION_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ERROR_MESSAGES,
} from "@learn-anything/shared";

/**
 * POST /api/upload — Upload a completion image to Supabase Storage
 * Accepts multipart/form-data with a single "file" field.
 * Returns the public URL of the uploaded image.
 */
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

  // Validate file type
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

  // Validate file size
  if (file.size > MAX_COMPLETION_FILE_SIZE) {
    return jsonResponse(
      {
        success: false,
        error: ERROR_MESSAGES.FILE_TOO_LARGE,
      },
      { status: 400 },
      request
    );
  }

  // Generate a unique file path: {userId}/{timestamp}-{randomSuffix}.{ext}
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const filePath = `${user.id}/${timestamp}-${randomSuffix}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("completion-images")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.UPLOAD_FAILED },
      { status: 500 },
      request
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("completion-images")
    .getPublicUrl(filePath);

  return jsonResponse({ success: true, url: publicUrl }, undefined, request);
});

export { handleOptions as OPTIONS };

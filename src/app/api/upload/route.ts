import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";
import { MAX_COMPLETION_FILE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants/validation";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

/**
 * POST /api/upload — Upload a completion image to Supabase Storage
 * Accepts multipart/form-data with a single "file" field.
 * Returns the public URL of the uploaded image.
 */
export const POST = withAuth(async (request, { user, supabase }) => {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.NO_FILE_PROVIDED },
      { status: 400 }
    );
  }

  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        success: false,
        error: ERROR_MESSAGES.FILE_INVALID_TYPE,
      },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_COMPLETION_FILE_SIZE) {
    return NextResponse.json(
      {
        success: false,
        error: ERROR_MESSAGES.FILE_TOO_LARGE,
      },
      { status: 400 }
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
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.UPLOAD_FAILED },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("completion-images")
    .getPublicUrl(filePath);

  return NextResponse.json({ success: true, url: publicUrl });
});

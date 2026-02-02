import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";
import { displayNameSchema } from "@/lib/validation";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

export const PUT = withAuth(async (request, { user, supabase }) => {
  const body = await request.json();
  const { full_name } = body;

  if (typeof full_name !== "string") {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.DISPLAY_NAME_REQUIRED },
      { status: 400 }
    );
  }

  const trimmedName = full_name.trim();
  const result = displayNameSchema.safeParse(trimmedName);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ full_name: trimmedName })
    .eq("id", user.id);

  if (updateError) {
    console.error("Profile update error:", updateError);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.PROFILE_UPDATE_FAILED },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
});

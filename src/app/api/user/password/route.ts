import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";
import { passwordSchema } from "@/lib/validation";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

export const PUT = withAuth(async (request, { user, supabase }) => {
  // Block password change for OAuth users
  const provider = user.app_metadata?.provider;
  if (provider && provider !== "email") {
    return NextResponse.json(
      {
        success: false,
        error: ERROR_MESSAGES.PASSWORD_OAUTH_BLOCKED,
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { current_password, new_password } = body;

  if (typeof current_password !== "string" || !current_password) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.PASSWORD_CURRENT_REQUIRED },
      { status: 400 }
    );
  }

  if (typeof new_password !== "string" || !new_password) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.PASSWORD_NEW_REQUIRED },
      { status: 400 }
    );
  }

  const result = passwordSchema.safeParse(new_password);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: current_password,
  });

  if (signInError) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.PASSWORD_INCORRECT },
      { status: 403 }
    );
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: new_password,
  });

  if (updateError) {
    console.error("Password update error:", updateError);
    return NextResponse.json(
      { success: false, error: updateError.message || ERROR_MESSAGES.PASSWORD_UPDATE_FAILED },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
});

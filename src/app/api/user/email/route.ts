import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";
import { emailSchema } from "@/lib/validation";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

export const PUT = withAuth(async (request, { user, supabase }) => {
  // Block email change for OAuth users
  const provider = user.app_metadata?.provider;
  if (provider && provider !== "email") {
    return NextResponse.json(
      {
        success: false,
        error: ERROR_MESSAGES.EMAIL_OAUTH_BLOCKED,
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { email } = body;

  if (typeof email !== "string") {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.EMAIL_REQUIRED },
      { status: 400 }
    );
  }

  const trimmedEmail = email.trim().toLowerCase();

  const result = emailSchema.safeParse(trimmedEmail);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  if (trimmedEmail === user.email) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.EMAIL_SAME },
      { status: 400 }
    );
  }

  // Update email via Supabase Auth (sends confirmation email)
  const { error: updateError } = await supabase.auth.updateUser({
    email: trimmedEmail,
  });

  if (updateError) {
    console.error("Email update error:", updateError);
    // Handle duplicate email
    if (updateError.message?.includes("already been registered") ||
        updateError.message?.includes("already exists")) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.EMAIL_ALREADY_IN_USE },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: updateError.message || ERROR_MESSAGES.EMAIL_UPDATE_FAILED },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "A confirmation email has been sent to your new address. Please verify it to complete the change.",
  });
});

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Block password change for OAuth users
    const provider = user.app_metadata?.provider;
    if (provider && provider !== "email") {
      return NextResponse.json(
        {
          success: false,
          error: "Password cannot be changed for accounts signed in with a third-party provider",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { current_password, new_password } = body;

    if (typeof current_password !== "string" || !current_password) {
      return NextResponse.json(
        { success: false, error: "Current password is required" },
        { status: 400 }
      );
    }

    if (typeof new_password !== "string" || !new_password) {
      return NextResponse.json(
        { success: false, error: "New password is required" },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters" },
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
        { success: false, error: "Current password is incorrect" },
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
        { success: false, error: updateError.message || "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

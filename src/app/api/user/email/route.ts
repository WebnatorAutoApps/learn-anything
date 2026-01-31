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

    // Block email change for OAuth users
    const provider = user.app_metadata?.provider;
    if (provider && provider !== "email") {
      return NextResponse.json(
        {
          success: false,
          error: "Email cannot be changed for accounts signed in with a third-party provider",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (trimmedEmail === user.email) {
      return NextResponse.json(
        { success: false, error: "New email is the same as the current email" },
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
          { success: false, error: "This email is already in use by another account" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: updateError.message || "Failed to update email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "A confirmation email has been sent to your new address. Please verify it to complete the change.",
    });
  } catch (error) {
    console.error("Email update error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

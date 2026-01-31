import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt, extractLast4 } from "@/lib/crypto";

const MAX_TONE_LENGTH = 500;

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

    const body = await request.json();
    const { gemini_api_key, tone } = body;

    // Username changes are handled by the dedicated /api/user/username endpoint
    if ("username" in body) {
      return NextResponse.json(
        { success: false, error: "Use PUT /api/user/username to change your username" },
        { status: 400 }
      );
    }

    if (gemini_api_key !== undefined && typeof gemini_api_key !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid API key format" },
        { status: 400 }
      );
    }

    if (tone !== undefined && typeof tone !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid tone format" },
        { status: 400 }
      );
    }

    if (typeof tone === "string" && tone.length > MAX_TONE_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Tone must be ${MAX_TONE_LENGTH} characters or less` },
        { status: 400 }
      );
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
          return NextResponse.json(
            {
              success: false,
              error: detail
                ? `Server configuration error: ${detail}`
                : "Server configuration error — unable to encrypt API key",
            },
            { status: 500 }
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

    // Nothing to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select("id");

    if (updateError) {
      console.error("Settings update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update settings" },
        { status: 500 }
      );
    }

    // If no rows were updated, the profile doesn't exist yet
    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Profile not found — please reload and try again" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...(gemini_api_key !== undefined && {
        api_key_last4: !gemini_api_key?.trim() ? null : updateData.api_key_last4,
      }),
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

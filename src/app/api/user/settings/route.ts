import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt, extractLast4 } from "@/lib/crypto";

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
    const { gemini_api_key } = body;

    if (gemini_api_key !== undefined && typeof gemini_api_key !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid API key format" },
        { status: 400 }
      );
    }

    // Determine values to store
    const keyValue =
      typeof gemini_api_key === "string" ? gemini_api_key.trim() : null;
    const isClearing = !keyValue;

    const updateData = isClearing
      ? { encrypted_api_key: null, api_key_last4: null }
      : {
          encrypted_api_key: encrypt(keyValue),
          api_key_last4: extractLast4(keyValue),
        };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (updateError) {
      console.error("Settings update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      api_key_last4: isClearing ? null : updateData.api_key_last4,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

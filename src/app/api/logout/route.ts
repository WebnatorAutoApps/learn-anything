import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.UNEXPECTED },
      { status: 500 }
    );
  }
}

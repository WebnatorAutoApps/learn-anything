import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/api/rateLimit";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

const signupLimiter = createRateLimiter(5, 3_600_000); // 5 req/IP/hour

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed, retryAfterMs } = signupLimiter(ip);

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.RATE_LIMIT_SIGNUP },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  const body = await request.json();
  const { email, password, fullName } = body;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.EMAIL_PASSWORD_REQUIRED },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Check if user needs to confirm their email
    if (data.user && !data.session) {
      return NextResponse.json({
        success: true,
        message: "Please check your email to confirm your account",
        requiresConfirmation: true,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.UNEXPECTED },
      { status: 500 }
    );
  }
}

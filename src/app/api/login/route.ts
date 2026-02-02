import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/api/rateLimit";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

const loginLimiter = createRateLimiter(10, 60_000); // 10 req/IP/minute

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed, retryAfterMs } = loginLimiter(ip);

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.RATE_LIMIT_LOGIN },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.EMAIL_PASSWORD_REQUIRED },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.UNEXPECTED },
      { status: 500 }
    );
  }
}

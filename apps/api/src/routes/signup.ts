import { jsonResponse, handleOptions } from "../lib/cors";
import { createAdminClient } from "../lib/supabase";
import { createRateLimiter } from "../lib/rateLimit";
import { ERROR_MESSAGES } from "@learn-anything/shared";

const signupLimiter = createRateLimiter(5, 3_600_000); // 5 req/IP/hour

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed, retryAfterMs } = signupLimiter(ip);

  if (!allowed) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.RATE_LIMIT_SIGNUP },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      },
      request
    );
  }

  const body = await request.json();
  const { email, password, fullName } = body;

  if (!email || !password) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.EMAIL_PASSWORD_REQUIRED },
      { status: 400 },
      request
    );
  }

  try {
    const supabase = createAdminClient();

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
      return jsonResponse(
        { success: false, error: error.message },
        { status: 400 },
        request
      );
    }

    // Check if user needs to confirm their email
    if (data.user && !data.session) {
      return jsonResponse(
        {
          success: true,
          message: "Please check your email to confirm your account",
          requiresConfirmation: true,
        },
        undefined,
        request
      );
    }

    return jsonResponse(
      {
        success: true,
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
      },
      undefined,
      request
    );
  } catch (error) {
    console.error("Signup error:", error);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.UNEXPECTED },
      { status: 500 },
      request
    );
  }
}

export { handleOptions as OPTIONS };

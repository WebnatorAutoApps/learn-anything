import { jsonResponse, handleOptions } from "../lib/cors";
import { createAdminClient } from "../lib/supabase";
import { createRateLimiter } from "../lib/rateLimit";
import { ERROR_MESSAGES } from "@learn-anything/shared";

const loginLimiter = createRateLimiter(10, 60_000); // 10 req/IP/minute

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed, retryAfterMs } = loginLimiter(ip);

  if (!allowed) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.RATE_LIMIT_LOGIN },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      },
      request
    );
  }

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.EMAIL_PASSWORD_REQUIRED },
      { status: 400 },
      request
    );
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return jsonResponse(
        { success: false, error: error.message },
        { status: 401 },
        request
      );
    }

    return jsonResponse(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      undefined,
      request
    );
  } catch (error) {
    console.error("Login error:", error);
    return jsonResponse(
      { success: false, error: ERROR_MESSAGES.UNEXPECTED },
      { status: 500 },
      request
    );
  }
}

export { handleOptions as OPTIONS };

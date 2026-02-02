import { createClient } from "./supabase";
import { jsonResponse } from "./cors";
import { ERROR_MESSAGES } from "@learn-anything/shared";
import type { User, SupabaseClient } from "@supabase/supabase-js";

interface AuthContext {
  user: User;
  supabase: SupabaseClient;
  token: string;
}

type AuthenticatedHandler = (
  request: Request,
  context: AuthContext
) => Promise<Response>;

type AuthenticatedParamsHandler<P> = (
  request: Request,
  context: AuthContext & { params: P }
) => Promise<Response>;

/**
 * Extract Bearer token from Authorization header.
 */
function extractToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

/**
 * Wraps an API route handler with Bearer token authentication.
 * Replaces the cookie-based withAuth from the Next.js version.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: Request): Promise<Response> => {
    try {
      const token = extractToken(request);
      if (!token) {
        return jsonResponse(
          { success: false, error: ERROR_MESSAGES.NOT_AUTHENTICATED },
          { status: 401 },
          request
        );
      }

      const supabase = createClient(token);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return jsonResponse(
          { success: false, error: ERROR_MESSAGES.NOT_AUTHENTICATED },
          { status: 401 },
          request
        );
      }

      return await handler(request, { user, supabase, token });
    } catch (error) {
      console.error("API error:", error);
      return jsonResponse(
        { success: false, error: ERROR_MESSAGES.UNEXPECTED },
        { status: 500 },
        request
      );
    }
  };
}

/**
 * Like `withAuth`, but also accepts route params.
 * For routes like `/api/courses/[id]/enroll`.
 */
export function withAuthParams<P>(handler: AuthenticatedParamsHandler<P>) {
  return async (
    request: Request,
    { params }: { params: P }
  ): Promise<Response> => {
    try {
      const token = extractToken(request);
      if (!token) {
        return jsonResponse(
          { success: false, error: ERROR_MESSAGES.NOT_AUTHENTICATED },
          { status: 401 },
          request
        );
      }

      const supabase = createClient(token);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return jsonResponse(
          { success: false, error: ERROR_MESSAGES.NOT_AUTHENTICATED },
          { status: 401 },
          request
        );
      }

      return await handler(request, { user, supabase, token, params });
    } catch (error) {
      console.error("API error:", error);
      return jsonResponse(
        { success: false, error: ERROR_MESSAGES.UNEXPECTED },
        { status: 500 },
        request
      );
    }
  };
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import type { User, SupabaseClient } from "@supabase/supabase-js";

interface AuthContext {
  user: User;
  supabase: SupabaseClient;
}

type AuthenticatedHandler = (
  request: Request,
  context: AuthContext
) => Promise<NextResponse>;

type AuthenticatedParamsHandler<P> = (
  request: Request,
  context: AuthContext & { params: P }
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with authentication.
 * Handles: Supabase client creation, auth verification, try/catch with consistent error format.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      const supabase = await createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: ERROR_MESSAGES.NOT_AUTHENTICATED },
          { status: 401 }
        );
      }

      return await handler(request, { user, supabase });
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.UNEXPECTED },
        { status: 500 }
      );
    }
  };
}

/**
 * Like `withAuth`, but also resolves dynamic route params.
 * For routes like `courses/[id]/enroll/route.ts`.
 */
export function withAuthParams<P>(handler: AuthenticatedParamsHandler<P>) {
  return async (
    request: Request,
    { params }: { params: Promise<P> }
  ): Promise<NextResponse> => {
    try {
      const resolvedParams = await params;
      const supabase = await createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: ERROR_MESSAGES.NOT_AUTHENTICATED },
          { status: 401 }
        );
      }

      return await handler(request, { user, supabase, params: resolvedParams });
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.UNEXPECTED },
        { status: 500 }
      );
    }
  };
}

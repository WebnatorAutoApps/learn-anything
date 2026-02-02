import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  // Determine the correct redirect base URL, accounting for reverse proxies (e.g. Vercel)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const isLocalEnv = process.env.NODE_ENV === "development";

  function getRedirectUrl(path: string): string {
    if (isLocalEnv) {
      return `${origin}${path}`;
    }
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}${path}`;
    }
    return `${origin}${path}`;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(getRedirectUrl(next));
      response.headers.set("Cache-Control", "no-store, max-age=0");
      return response;
    }

    console.error("Auth callback: code exchange failed", error.message);
  }

  const response = NextResponse.redirect(getRedirectUrl("/login?error=auth_failed"));
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

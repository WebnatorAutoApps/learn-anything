import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/api/login", "/signup", "/api/signup", "/api/logout", "/auth/callback", "/privacy-policy", "/terms-and-conditions"];
const AUTH_PAGES = ["/login", "/signup"];

// Paths that are publicly accessible (no auth required) but not login/signup pages
const PUBLIC_CONTENT_PATTERNS = [/^\/course\/[^/]+$/, /^\/api\/courses\/[^/]+$/];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set("Cache-Control", "no-store, max-age=0");
      return response;
    }
    return NextResponse.next();
  }

  // Update and validate Supabase session for all routes
  const { supabaseResponse, user } = await updateSession(request);

  // Redirect logged-in users away from auth pages
  if (user && AUTH_PAGES.some((path) => pathname === path)) {
    const homeUrl = new URL("/app", request.url);
    const response = NextResponse.redirect(homeUrl);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  // Allow root (landing page) without authentication
  if (pathname === "/") {
    return supabaseResponse;
  }

  // Allow public paths without authentication
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return supabaseResponse;
  }

  // Allow public content paths (course overview pages, course detail API)
  if (PUBLIC_CONTENT_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return supabaseResponse;
  }

  if (!user) {
    // User is not authenticated, redirect to login
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};

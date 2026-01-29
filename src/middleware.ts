import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/api/login", "/signup", "/api/signup", "/api/logout", "/auth/callback"];
const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Update and validate Supabase session for all routes
  const { supabaseResponse, user } = await updateSession(request);

  // Redirect logged-in users away from auth pages
  if (user && AUTH_PAGES.some((path) => pathname === path)) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Allow public paths without authentication
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return supabaseResponse;
  }

  if (!user) {
    // User is not authenticated, redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};

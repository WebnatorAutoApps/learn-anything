import { NextResponse } from "next/server";

const VALID_USERNAME = "test";
const VALID_PASSWORD = "Learn1234!";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
  }

  return NextResponse.json(
    { success: false, error: "Invalid username or password" },
    { status: 401 }
  );
}

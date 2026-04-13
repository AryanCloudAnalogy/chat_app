import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Skip proxy for auth routes to avoid infinite loops or blocking login
  // if (
  //   request.nextUrl.pathname.startsWith("/api/auth/login") ||
  //   request.nextUrl.pathname.startsWith("/api/auth/signup")
  // ) {
  //   return response;
  // }
  return response;

  const token = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!token && !refreshToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return response;
}

export const config = {
  matcher: [],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token");

  if (pathname === "/sign-in" && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !authToken) {
    const redirectUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

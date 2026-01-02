import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = new Set(["/", "/login", "/register"]);
const PUBLIC_API_ROUTES = new Set(["/api/auth/login", "/api/auth/register"]);
const AUTH_REDIRECT_ROUTES = new Set(["/login", "/register"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const headers = new Headers(request.headers);
  headers.set("x-current-path", pathname);

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next({ headers });
  }
  if (PUBLIC_ROUTES.has(pathname)) return NextResponse.next();

  const token = request.cookies.get("token")?.value;

  if (token && AUTH_REDIRECT_ROUTES.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/chat";
    return NextResponse.redirect(url, {
      headers,
    });
  }

  if (!token && !PUBLIC_ROUTES.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url, {
      headers,
    });
  }

  return NextResponse.next({ headers });
}

export const config = {
  matcher: "/:path*",
};

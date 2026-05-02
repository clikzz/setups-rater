import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./lib/auth";

const COOKIE_NAME = "session";
const LOGIN_PATH = "/";
const PROTECTED_PATH = "/setups";
const PROTECTED_API_PATHS = ["/api/state", "/api/setups", "/api/reset"];

function isProtectedApi(pathname: string): boolean {
  return PROTECTED_API_PATHS.some((p) => pathname.startsWith(p));
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = token ? await verifySession(token) : false;

  if (pathname === LOGIN_PATH && isAuthenticated) {
    return NextResponse.redirect(new URL(PROTECTED_PATH, request.url));
  }

  if (isProtectedApi(pathname) && !isAuthenticated) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (pathname.startsWith(PROTECTED_PATH) && !isAuthenticated) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/setups/:path*", "/api/state", "/api/setups", "/api/reset"],
};

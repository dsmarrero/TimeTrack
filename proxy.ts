import { NextResponse, NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

const PROTECTED_PATHS = ["/dashboard", "/proyectos", "/empleados", "/tiempos", "/informes"];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/proyectos/:path*", "/empleados/:path*", "/tiempos/:path*", "/informes/:path*", "/login"],
};

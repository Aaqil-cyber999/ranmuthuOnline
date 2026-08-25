import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken } from "./lib/security/jwt";
import type { AdminPayload } from "./lib/security/jwt";

async function getStaffSession(request: NextRequest): Promise<AdminPayload | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login/session/logout endpoints handle their own logic.
  if (pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isWriteMethod = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  const isProtectedApi =
    pathname.startsWith("/api/admin") ||
    ((pathname.startsWith("/api/products") || pathname.startsWith("/api/categories")) && isWriteMethod);

  if (!isAdminPage && !isProtectedApi) {
    return NextResponse.next();
  }

  // Only OWNER / STAFF roles may pass. verifyToken rejects tokens without a
  // valid role, so customers or stale tokens are treated as unauthenticated.
  const session = await getStaffSession(request);
  if (session) {
    return NextResponse.next();
  }

  if (isAdminPage) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
  ],
};

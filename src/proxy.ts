import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";
import {
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  LOGIN_ROUTE,
  matchesRoute,
  publicRoutes,
} from "@/lib/routes";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Optimistic check: only looks for the session cookie, no database call.
  // Private pages must still verify with requireSession() from src/lib/session.ts.
  const hasSessionCookie = getSessionCookie(request) !== null;

  if (matchesRoute(pathname, authRoutes)) {
    // Validate for real here (sign-in pages are low traffic) so a stale cookie
    // can't bounce the user between the login page and a private page.
    if (hasSessionCookie && (await auth.api.getSession({ headers: request.headers }))) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
    }
    return NextResponse.next();
  }

  if (matchesRoute(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  // Private route: send signed-out users to login, remembering where they were going.
  if (!hasSessionCookie) {
    const loginUrl = new URL(LOGIN_ROUTE, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes (incl. Better Auth's /api/auth), Next.js internals and static files.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

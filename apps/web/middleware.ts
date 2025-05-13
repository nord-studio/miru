import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  const hostname = request.headers.get("host");
  const searchParams = request.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  if (path.startsWith("/admin")) {
    const sessionCookie = getSessionCookie(request, {
      cookiePrefix: "miru",
    });

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.next();
  }

  // Allow static files in dev mode
  if (path.includes(".png")) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(
    new URL(`/status-page/${hostname}${path}`, request.url),
  );
}

export const config = {
  matcher: [
    // Exclude /api/*, /_next/*, /_static/*, /auth/*, /onboarding/*, /join/* and static files
    "/((?!api/|_next/|auth|join|onboarding|_static/[\\w-]+\\.\\w+).*)",
  ],
};

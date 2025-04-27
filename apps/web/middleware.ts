import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function checkSession(request: NextRequest) {
	const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: request.nextUrl.origin.replace("https", process.env.APP_ENV === "development" ? "http" : "https"),
		headers: {
			cookie: request.headers.get("cookie") || "",
		},
	});

	if (!session) {
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}
}

export async function middleware(request: NextRequest) {
	const url = request.nextUrl.clone();

	const hostname = request.headers.get("host");
	const searchParams = request.nextUrl.searchParams.toString();
	const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;
	const appDomain = process.env.APP_DOMAIN ?? "localhost:3000";

	if (hostname === appDomain && path.startsWith("/admin")) {
		await checkSession(request);
		return NextResponse.next();
	}

	return NextResponse.rewrite(new URL(`/status-page/${hostname}${path}`, request.url));
}

export const config = {
	matcher: [
		// Exclude /api/*, /_next/*, /_static/*, /auth/*, /join/* and static files
		"/((?!api/|_next/|auth|join|_static/[\\w-]+\\.\\w+).*)",
	],
};
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_HOME_PATH = "/admin/review-submissions";

function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  });
  const pathname = request.nextUrl.pathname;
  const isAdminUser = token?.role === "ADMIN";

  if (isAdminRoute(pathname)) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "callbackUrl",
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdminUser) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname === "/admin" || pathname === "/admin/dashboard") {
      return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (isAdminUser) {
    return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};

import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { pathname, origin, search } = request.nextUrl;
  const response = NextResponse.next();

  const publicRoutes = ["/", "/login", "/signup"];
  if (publicRoutes.includes(pathname)) return response;

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: origin,
      headers: { cookie: request.headers.get("cookie") || "" },
    },
  );

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    const reauth = request.cookies.get("reauthenticated")?.value === "1";
    if (!reauth) {
      const redirectUrl = new URL("/scan", origin);
      redirectUrl.searchParams.set("next", pathname + search);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  response.cookies.delete({ name: "reauthenticated", path: "/dashboard" });

  if (pathname.startsWith("/admin") && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
};

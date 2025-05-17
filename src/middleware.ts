import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.BETTER_AUTH_SECRET!;

async function verifyFlag(signed: string) {
  const [value, sig] = signed.split(".");
  if (!value || !sig) return null;

  let base64 = sig.replace(/-/g, "+").replace(/_/g, "/");

  while (base64.length % 4) {
    base64 += "=";
  }

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const sigBuf = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const ok = await crypto.subtle.verify("HMAC", key, sigBuf, enc.encode(value));

  return ok ? value : null;
}

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { pathname, origin, search } = request.nextUrl;
  const response = NextResponse.next();

  const publicRoutes = ["/", "/login", "/signup"];
  if (publicRoutes.includes(pathname)) {
    response.cookies.delete({ name: "reauthenticated", path: "/dashboard" });
    return response;
  }
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
    const raw = request.cookies.get("reauthenticated")?.value ?? "";
    if ((await verifyFlag(raw)) !== "1") {
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

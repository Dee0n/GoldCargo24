import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/tracks/search", "/api/settings"];
const ADMIN_PATHS = ["/admin"];
const CLIENT_PATHS = ["/dashboard", "/parcels", "/archive", "/profile", "/track"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths — always allowed
  if (pathname === "/" || pathname === "/login" || pathname === "/register") return NextResponse.next();
  if (pathname.startsWith("/api/auth/")) return NextResponse.next();
  if (pathname.startsWith("/api/tracks/search")) return NextResponse.next();
  if (pathname === "/api/settings" && request.method === "GET") return NextResponse.next();

  // Static / public assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get("access_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // Admin routes require ADMIN role
    if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
      if (role !== "ADMIN") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-user-phone", payload.phone as string);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Token invalid/expired
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

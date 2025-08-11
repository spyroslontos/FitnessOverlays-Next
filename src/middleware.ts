import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin: string | null, allowlist: string[]): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (!["http:", "https:"].includes(url.protocol)) return false;
  } catch {
    return false;
  }
  return allowlist.includes(origin);
}

export function middleware(request: NextRequest) {
  const allowlist = getAllowedOrigins();
  const origin = request.headers.get("origin");
  const isPreflight = request.method === "OPTIONS";
  const secFetchSite = request.headers.get("sec-fetch-site");
  const method = request.method.toUpperCase();

  const response = isPreflight
    ? new NextResponse(null, { status: 204 })
    : NextResponse.next();

  // CORS for API routes only (scoped via matcher below)
  if (origin && isAllowedOrigin(origin, allowlist)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      request.headers.get("access-control-request-headers") ??
        "authorization,content-type"
    );
    response.headers.set("Access-Control-Max-Age", "600");
  } else {
    // Fast-fail unknown origins for preflight
    if (isPreflight && origin) {
      return new NextResponse("CORS not allowed", { status: 403 });
    }
  }

  // Basic CSRF mitigation for state-changing requests.
  // Allow if the request's Origin is explicitly allowlisted; otherwise block cross-site.
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const isCrossSite = secFetchSite === "cross-site";
    const originAllowed = isAllowedOrigin(origin, allowlist);
    if (isCrossSite && !originAllowed) {
      return new NextResponse("Cross-site request forbidden", { status: 403 });
    }
  }

  // API-only hardening headers not set globally
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
  );
  // Let individual routes choose Cache-Control semantics

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};

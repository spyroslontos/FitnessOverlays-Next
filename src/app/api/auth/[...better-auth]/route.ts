import { auth } from "@/lib/auth";
import { rateLimitHit, getClientIpFromHeaders } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!path.endsWith("/get-session")) {
    const ip = getClientIpFromHeaders(request.headers);
    if (!rateLimitHit(`ip:${ip}:auth`, 60, 60_000)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  return auth.handler(request);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (!path.endsWith("/get-session")) {
    const ip = getClientIpFromHeaders(request.headers);
    if (!rateLimitHit(`ip:${ip}:auth`, 60, 60_000)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  return auth.handler(request);
}

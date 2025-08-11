import { auth } from "@/lib/auth";
import { syncAthleteData } from "@/lib/strava";
import { NextResponse } from "next/server";
import { rateLimitHit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Simple per-user rate limit to avoid spammy cooldown checks
    const ok = rateLimitHit(`user:${session.user.id}:sync`, 6, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again shortly." },
        { status: 429 }
      );
    }

    const wasSynced = await syncAthleteData(session.user.id);

    const res = NextResponse.json({
      success: true,
      synced: wasSynced,
      message: wasSynced ? "Fresh data fetched" : "Using cached data",
    });
    // No-store since this triggers background or fresh data
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Sync API error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

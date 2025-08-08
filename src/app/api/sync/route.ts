import { auth } from "@/lib/auth";
import { syncAthleteData } from "@/lib/strava";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const wasSynced = await syncAthleteData(session.user.id);

    return NextResponse.json({
      success: true,
      synced: wasSynced,
      message: wasSynced ? "Fresh data fetched" : "Using cached data",
    });
  } catch (error) {
    console.error("Sync API error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

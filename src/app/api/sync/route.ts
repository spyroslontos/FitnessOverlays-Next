import { authClient } from "@/lib/auth-client";
import { syncAthleteData } from "@/lib/strava";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await authClient.getSession();
    
    if (!session?.data?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const wasSynced = await syncAthleteData(session.data.user.id);
    
    return NextResponse.json({ 
      success: true, 
      synced: wasSynced,
      message: wasSynced ? "Fresh data fetched" : "Using cached data"
    });
  } catch (error) {
    console.error("Sync API error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
} 
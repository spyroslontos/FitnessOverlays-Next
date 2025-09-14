import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("🌐 Making Strava API call to /athlete/activities endpoint");

    const response = await fetch(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        next: { revalidate: 180 }, // Cache for 3 minutes
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    console.log("📡 Strava API response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch activities data: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Activities data received:", data.length, "activities");

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=180, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

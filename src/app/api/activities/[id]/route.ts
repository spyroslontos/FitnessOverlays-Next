import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    // Validate activity ID - must be a positive integer
    const activityId = parseInt(id, 10);
    if (isNaN(activityId) || activityId <= 0 || !Number.isInteger(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID. Must be a positive integer." },
        { status: 400 }
      );
    }
    console.log("🌐 Making Strava API call to /activities/" + activityId);

    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
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
      throw new Error(`Failed to fetch activity data: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Activity data received:", data.name);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=180, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

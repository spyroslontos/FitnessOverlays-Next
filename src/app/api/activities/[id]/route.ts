import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

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

    // Validate activity ID
    const activityId = parseInt(id, 10);
    if (
      isNaN(activityId) ||
      activityId <= 0 ||
      activityId > 999999999999 ||
      !Number.isInteger(activityId)
    ) {
      return NextResponse.json(
        { error: "Invalid activity ID. Must be a positive integer." },
        { status: 400 }
      );
    }

    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "No user ID" }, { status: 401 });
    }

    // Check DB cache first - ensure activity belongs to current user
    const cached = await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.activityId, activityId),
          eq(activities.userId, parseInt(userId, 10))
        )
      )
      .limit(1);

    if (cached.length > 0) {
      const lastSynced = cached[0].lastSynced;
      const isStale = Date.now() - lastSynced.getTime() > CACHE_DURATION;

      if (!isStale) {
        console.log("💾 Returning from DB cache");
        return NextResponse.json(cached[0].data);
      }
    }

    console.log("🌐 Fetching from Strava API");

    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch activity data: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Activity data received:", data.name);

    // Security check: ensure activity belongs to current user
    const activityOwnerId = data.athlete?.id;
    if (!activityOwnerId || activityOwnerId !== parseInt(userId, 10)) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Store in DB
    await db
      .insert(activities)
      .values({
        activityId: data.id,
        userId: parseInt(userId, 10),
        data: data,
        lastSynced: new Date(),
      })
      .onConflictDoUpdate({
        target: activities.activityId,
        set: {
          data: data,
          lastSynced: new Date(),
        },
      });
    console.log("💾 Activity stored in database");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

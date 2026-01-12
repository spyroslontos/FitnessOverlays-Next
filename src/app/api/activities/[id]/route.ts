import { auth } from "@/lib/auth"
import { db } from "@/db"
import { activities } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

const CACHE_DURATION = 5 * 60 * 1000 // 3 minutes
const CACHE_MAX_AGE = 180 // 3 minutes

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth()

    if (!session?.accessToken || !session.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const activityId = parseInt(id, 10)
    const userId = parseInt(session.user.id, 10)

    // Validate ID
    if (isNaN(activityId) || activityId <= 0) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 },
      )
    }

    // 1. Check DB cache
    const cached = await db
      .select()
      .from(activities)
      .where(and(eq(activities.activityId, activityId), eq(activities.userId, userId)))
      .limit(1)

    if (cached.length > 0) {
      const isFresh = Date.now() - cached[0].lastSynced.getTime() < CACHE_DURATION
      if (isFresh) {
        return NextResponse.json(cached[0].data, {
          headers: {
            "Cache-Control": `private, max-age=${CACHE_MAX_AGE}`,
          },
        })
      }
    }

    // 2. Fetch from Strava API
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        signal: AbortSignal.timeout(10000),
      },
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Activity not found" }, { status: 404 })
      }
      throw new Error(`Strava API error: ${response.status}`)
    }

    const data = await response.json()

    // 3. Security check & Store in DB
    if (data.athlete?.id !== userId) {
      return NextResponse.json({ error: "Unauthorized activity access" }, { status: 403 })
    }

    await db
      .insert(activities)
      .values({
        activityId: data.id,
        userId,
        data,
        lastSynced: new Date(),
      })
      .onConflictDoUpdate({
        target: activities.activityId,
        set: {
          data,
          lastSynced: new Date(),
        },
      })

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `private, max-age=${CACHE_MAX_AGE}`,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/activities/[id]:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 },
    )
  }
}

import { auth } from "@/lib/auth"
import { db } from "@/db"
import { activityLists } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

const CACHE_DURATION = 3 * 60 * 1000 // 3 minutes
const CACHE_MAX_AGE = 180 // 3 minutes

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.accessToken || !session.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = parseInt(session.user.id, 10)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "30", 10)

    // Validate inputs
    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: "Invalid page number" }, { status: 400 })
    }
    if (isNaN(perPage) || perPage < 1 || perPage > 200) {
      return NextResponse.json({ error: "Invalid per_page (1-200)" }, { status: 400 })
    }

    // 1. Check DB cache
    const cached = await db
      .select()
      .from(activityLists)
      .where(and(eq(activityLists.userId, userId), eq(activityLists.page, page)))
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
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        signal: AbortSignal.timeout(10000),
      },
    )

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Token expired, please re-authenticate" },
          { status: 401 },
        )
      }
      throw new Error(`Strava API error: ${response.status}`)
    }

    const data = await response.json()

    // 3. Security Check & Store in DB
    if (data.length > 0) {
      const athleteId = data[0].athlete?.id
      
      // CRITICAL: Strictly ensure data belongs to the authenticated user
      if (athleteId !== userId) {
        console.error(`Security Mismatch: Token for user ${userId} returned data for athlete ${athleteId}`)
        return NextResponse.json({ error: "Unauthorized data access" }, { status: 403 })
      }

      await db
        .insert(activityLists)
        .values({
          userId,
          data,
          page,
          perPage,
          lastSynced: new Date(),
        })
        .onConflictDoUpdate({
          target: [activityLists.userId, activityLists.page],
          set: {
            data,
            perPage,
            lastSynced: new Date(),
          },
        })
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `private, max-age=${CACHE_MAX_AGE}`,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/activities:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    )
  }
}

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { activityLists } from "@/db/schema"
import { eq, and } from "drizzle-orm"

const CACHE_DURATION = 3 * 60 * 1000 // 3 minutes

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user?.id
    if (!userId) {
      return NextResponse.json({ error: "No user ID" }, { status: 401 })
    }

    // Parse URL parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const perPage = parseInt(searchParams.get('per_page') || '30', 10)

    // Check DB cache first for this specific page
    const cached = await db
      .select()
      .from(activityLists)
      .where(and(
        eq(activityLists.userId, parseInt(userId, 10)),
        eq(activityLists.page, page)
      ))
      .limit(1)

    if (cached.length > 0) {
      const lastSynced = cached[0].lastSynced
      const isStale = Date.now() - lastSynced.getTime() > CACHE_DURATION

      if (!isStale) {
        console.log(`💾 Returning page ${page} from DB cache`)
        return NextResponse.json(cached[0].data)
      }
    }

    console.log(`🌐 Fetching page ${page} from Strava API`)

    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
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
      throw new Error(`Failed to fetch activities data: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Page ${page} activities data received:`, data.length, "activities")

    // Store in DB
    if (data.length > 0) {
      const athleteId = data[0].athlete?.id
      if (athleteId) {
        const existingRecord = await db
          .select()
          .from(activityLists)
          .where(and(
            eq(activityLists.userId, athleteId),
            eq(activityLists.page, page)
          ))
          .limit(1)

        if (existingRecord.length > 0) {
          await db
            .update(activityLists)
            .set({
              data: data,
              page: page,
              perPage: perPage,
              lastSynced: new Date(),
            })
            .where(and(
              eq(activityLists.userId, athleteId),
              eq(activityLists.page, page)
            ))
        } else {
          await db.insert(activityLists).values({
            userId: athleteId,
            data: data,
            page: page,
            perPage: perPage,
            lastSynced: new Date(),
          })
        }
        console.log(`💾 Activity list page ${page} stored in database`)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    )
  }
}

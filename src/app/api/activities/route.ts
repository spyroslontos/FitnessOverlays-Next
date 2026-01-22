import { auth } from "@/lib/auth"
import { db } from "@/db"
import { activityLists } from "@/db/schema"
import { and, eq, isNull } from "drizzle-orm"
import { NextResponse } from "next/server"

const SHORT_CACHE = 180 // 3 minutes
const LONG_CACHE = 86400 // 24 hours

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
    const before = searchParams.get("before")
    const after = searchParams.get("after")

    // Determine Cache Strategy
    const isHistorical = before && (parseInt(before) < (Date.now() / 1000) - 86400)
    const cacheMaxAge = isHistorical ? LONG_CACHE : SHORT_CACHE

    if (isNaN(page) || page < 1) return NextResponse.json({ error: "Invalid page" }, { status: 400 })
    if (isNaN(perPage) || perPage < 1 || perPage > 200) return NextResponse.json({ error: "Invalid per_page" }, { status: 400 })

    // 1. Check DB cache (Supports filtered queries now)
    const dbQuery = and(
        eq(activityLists.userId, userId),
        eq(activityLists.page, page),
        perPage ? eq(activityLists.perPage, perPage) : undefined,
        before ? eq(activityLists.before, parseInt(before)) : isNull(activityLists.before),
        after ? eq(activityLists.after, parseInt(after)) : isNull(activityLists.after),
    )

    const cached = await db
      .select()
      .from(activityLists)
      .where(dbQuery)
      .limit(1)

    if (cached.length > 0) {
      const isFresh = Date.now() - cached[0].lastSynced.getTime() < (cacheMaxAge * 1000)
      if (isFresh) {
        return NextResponse.json(cached[0].data, {
          headers: { "Cache-Control": `private, max-age=${cacheMaxAge}, stale-while-revalidate=600` }
        })
      }
    }

    // 2. Fetch Strava
    let stravaUrl = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`
    if (before) stravaUrl += `&before=${before}`
    if (after) stravaUrl += `&after=${after}`

    const response = await fetch(stravaUrl, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        next: { revalidate: 0 } 
    })

    if (!response.ok) {
        if (response.status === 401) return NextResponse.json({ error: "Token expired" }, { status: 401 })
        throw new Error(`Strava API error: ${response.status}`)
    }

    const data = await response.json()

    // 3. Update DB Cache
    if (data.length > 0) {
      if (data[0].athlete?.id === userId) {
         // Manual Upsert Logic since we dropped the unique constraint
         const existing = await db.select({ id: activityLists.id }).from(activityLists).where(dbQuery).limit(1)
         
         const payload = {
            userId,
            data,
            page,
            perPage,
            before: before ? parseInt(before) : null,
            after: after ? parseInt(after) : null,
            lastSynced: new Date(),
         }

         if (existing.length > 0) {
             await db.update(activityLists).set(payload).where(eq(activityLists.id, existing[0].id))
         } else {
             await db.insert(activityLists).values(payload)
         }
      }
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": `private, max-age=${cacheMaxAge}, stale-while-revalidate=600` }
    })
  } catch (error) {
    console.error("GET /api/activities error:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}

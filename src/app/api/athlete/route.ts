"use server"

import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { upsertUser } from "@/lib/user-sync"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

const CACHE_DURATION = 3 * 60 * 1000 // 3 minutes
const CACHE_MAX_AGE = 180 // 3 minutes

export async function GET() {
  try {
    const session = await auth()

    if (!session?.accessToken || !session.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = parseInt(session.user.id, 10)

    // 1. Check DB cache
    const cached = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (cached.length > 0) {
      const lastSynced = cached[0].lastStravaSync
      const isFresh = lastSynced && Date.now() - lastSynced.getTime() < CACHE_DURATION

      if (isFresh) {
        return NextResponse.json(cached[0].fullAthleteData, {
          headers: {
            "Cache-Control": `private, max-age=${CACHE_MAX_AGE}`,
          },
        })
      }
    }

    // 2. Fetch from Strava API if cache is stale or missing
    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      signal: AbortSignal.timeout(10000),
    })

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

    // 3. Security check & Store in DB
    if (data.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await upsertUser(data)

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `private, max-age=${CACHE_MAX_AGE}`,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/athlete:", error)
    return NextResponse.json(
      { error: "Failed to fetch athlete data" },
      { status: 500 },
    )
  }
}

"use server"

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { upsertUser } from "@/lib/user-sync"

const CACHE_DURATION = 3 * 60 * 1000 // 3 minutes

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user?.id
    if (!userId) {
      return NextResponse.json({ error: "No user ID" }, { status: 401 })
    }

    // Check DB cache first
    const cached = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId.toString(), 10)))
      .limit(1)

    if (cached.length > 0) {
      const lastSynced = cached[0].lastStravaSync
      if (lastSynced) {
        const isStale = Date.now() - lastSynced.getTime() > CACHE_DURATION

        if (!isStale) {
          console.log("💾 Returning from DB cache")
          return NextResponse.json(cached[0].fullAthleteData)
        }
      }
    }

    console.log("🌐 Fetching from Strava API")

    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Token expired, please re-authenticate" },
          { status: 401 },
        )
      }
      throw new Error(`Failed to fetch athlete data: ${response.status}`)
    }

    const data = await response.json()

    if (!data.id || typeof data.id !== "number" || data.id <= 0) {
      throw new Error("Invalid athlete data received from Strava")
    }

    // Security check: ensure athlete data belongs to current user
    if (data.id !== parseInt(userId, 10)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Store in DB
    await upsertUser(data)
    console.log("💾 Athlete data stored in database")

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching athlete:", error)
    return NextResponse.json(
      { error: "Failed to fetch athlete data" },
      { status: 500 },
    )
  }
}

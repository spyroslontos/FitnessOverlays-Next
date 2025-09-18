"use server";

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "No user ID" }, { status: 401 });
    }

    // Check DB cache first
    const cached = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId.toString(), 10)))
      .limit(1);

    if (cached.length > 0) {
      const lastSynced = cached[0].lastStravaSync;
      if (lastSynced) {
        const isStale = Date.now() - lastSynced.getTime() > CACHE_DURATION;

        if (!isStale) {
          console.log("💾 Returning from DB cache");
          return NextResponse.json(cached[0].fullAthleteData);
        }
      }
    }

    console.log("🌐 Fetching from Strava API");

    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch athlete data: ${response.status}`);
    }

    const data = await response.json();

    if (!data.id || typeof data.id !== "number" || data.id <= 0) {
      throw new Error("Invalid athlete data received from Strava");
    }

    // Security check: ensure athlete data belongs to current user
    if (data.id !== parseInt(userId, 10)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Store in DB
    const athleteId = data.id;
    await db
      .insert(users)
      .values({
        id: athleteId,
        name: `${data.firstname} ${data.lastname}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        athleteId: data.id,
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        bio: data.bio,
        city: data.city,
        state: data.state,
        country: data.country,
        sex: data.sex,
        premium: data.premium,
        summit: data.summit,
        badgeTypeId: data.badge_type_id,
        weight: data.weight,
        profileMedium: data.profile_medium,
        profile: data.profile,
        followerCount: data.follower_count,
        friendCount: data.friend_count,
        mutualFriendCount: data.mutual_friend_count,
        athleteType: data.athlete_type,
        datePreference: data.date_preference,
        measurementPreference: data.measurement_preference,
        postableClubsCount: data.postable_clubs_count,
        ftp: data.ftp,
        stravaCreatedAt: data.created_at ? new Date(data.created_at) : null,
        stravaUpdatedAt: data.updated_at ? new Date(data.updated_at) : null,
        fullAthleteData: data,
        lastStravaSync: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: `${data.firstname} ${data.lastname}`,
          updatedAt: new Date(),
          lastStravaSync: new Date(),
          username: data.username,
          firstname: data.firstname,
          lastname: data.lastname,
          bio: data.bio,
          city: data.city,
          state: data.state,
          country: data.country,
          sex: data.sex,
          premium: data.premium,
          summit: data.summit,
          badgeTypeId: data.badge_type_id,
          weight: data.weight,
          profileMedium: data.profile_medium,
          profile: data.profile,
          followerCount: data.follower_count,
          friendCount: data.friend_count,
          mutualFriendCount: data.mutual_friend_count,
          athleteType: data.athlete_type,
          datePreference: data.date_preference,
          measurementPreference: data.measurement_preference,
          postableClubsCount: data.postable_clubs_count,
          ftp: data.ftp,
          stravaCreatedAt: data.created_at ? new Date(data.created_at) : null,
          stravaUpdatedAt: data.updated_at ? new Date(data.updated_at) : null,
          fullAthleteData: data,
        },
      });
    console.log("💾 Athlete data stored in database");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching athlete:", error);
    return NextResponse.json(
      { error: "Failed to fetch athlete data" },
      { status: 500 }
    );
  }
}

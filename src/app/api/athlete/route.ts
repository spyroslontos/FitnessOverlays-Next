"use server";

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { users } from "@/db/schema";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      next: { revalidate: 180 }, // Cache for 3 minutes
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch athlete data: ${response.status}`);
    }

    const data = await response.json();

    // Sanitize and validate Strava data
    if (!data.id || typeof data.id !== "number" || data.id <= 0) {
      throw new Error("Invalid athlete data received from Strava");
    }

    // Store user data in database
    try {
      // Use Strava athlete ID as the primary key
      const userId = data.id;
      await db
        .insert(users)
        .values({
          id: userId,
          name: `${data.firstname} ${data.lastname}`,
          createdAt: new Date(),
          updatedAt: new Date(),

          // Strava athlete data - important fields for metrics/graphs
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

          // Strava timestamps
          stravaCreatedAt: data.created_at ? new Date(data.created_at) : null,
          stravaUpdatedAt: data.updated_at ? new Date(data.updated_at) : null,

          // Full JSON data for flexibility
          fullAthleteData: data,

          lastStravaSync: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: `${data.firstname} ${data.lastname}`,
            updatedAt: new Date(),
            lastStravaSync: new Date(),
            // Update Strava fields
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
    } catch (dbError) {
      console.error("Database write error (non-blocking):", dbError);
      // Don't fail the API call if DB write fails
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=180, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  } catch (error) {
    console.error("Error fetching athlete:", error);

    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Failed to fetch athlete data" },
      { status: 500 }
    );
  }
}

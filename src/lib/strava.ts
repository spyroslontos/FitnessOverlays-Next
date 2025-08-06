import { db, users, accounts } from "../db";
import { eq, and } from "drizzle-orm";

const SYNC_COOLDOWN = 60 * 1000; // 1 minute

export async function getAccessToken(userId: string): Promise<string | null> {
  const account = await db.select()
    .from(accounts)
    .where(and(
      eq(accounts.userId, userId),
      eq(accounts.providerId, "strava")
    ));
  
  return account[0]?.accessToken || null;
}

export async function syncAthleteData(userId: string) {
  // Check cooldown from database
  const user = await db.select({ lastStravaSync: users.lastStravaSync })
    .from(users)
    .where(eq(users.id, userId));
  
  const lastSync = user[0]?.lastStravaSync?.getTime() || 0;
  if (Date.now() - lastSync < SYNC_COOLDOWN) {
    return false; // Still in cooldown
  }
  
  const accessToken = await getAccessToken(userId);
  if (!accessToken) return false;
  
  try {
    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!response.ok) return false;
    
    const profile = await response.json();
    
    await db.update(users).set({
      athleteId: profile.id,
      athleteUsername: profile.username,
      athleteFirstName: profile.firstname,
      athleteLastName: profile.lastname,
      athleteProfile: profile.profile,
      profileMedium: profile.profile_medium,
      sex: profile.sex,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      followerCount: profile.follower_count,
      friendCount: profile.friend_count,
      datePreference: profile.date_preference,
      measurementPreference: profile.measurement_preference,
      weight: profile.weight,
      premium: profile.premium,
      athleteType: profile.athlete_type,
      lastStravaSync: new Date(),
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
    
    return true;
  } catch (error) {
    console.error("Strava sync failed:", error);
    return false;
  }
} 
"use server";

import { syncAthleteData } from "./strava";

export async function syncStravaData(userId: string) {
  try {
    const result = await syncAthleteData(userId);
    return result;
  } catch (error) {
    console.error("Sync failed:", error);
    return { synced: false, reason: "error", error: String(error) };
  }
}

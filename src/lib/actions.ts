"use server";

import { syncAthleteData } from "./strava";

export async function syncStravaData(userId: string) {
  try {
    const wasSynced = await syncAthleteData(userId);
    return { success: true, synced: wasSynced };
  } catch (error) {
    console.error("Sync failed:", error);
    return { success: false, error: "Sync failed" };
  }
} 
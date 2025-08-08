"use server";

import {
  syncAthleteData,
  getAthleteActivities,
  getActivityDetail,
} from "./strava";

export async function syncStravaData(userId: string) {
  try {
    const result = await syncAthleteData(userId);
    return result;
  } catch (error) {
    console.error("Sync failed:", error);
    return { synced: false, reason: "error", error: String(error) };
  }
}

export async function fetchActivities(userId: string, page = 1) {
  return getAthleteActivities(userId, page);
}

export async function fetchActivityDetail(userId: string, activityId: string) {
  return getActivityDetail(userId, activityId);
}

"use server";

import {
  syncAthleteData,
  getAthleteActivities,
  getActivityDetail,
} from "./strava";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function syncStravaData() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }
    const result = await syncAthleteData(session.user.id);
    return result;
  } catch (error) {
    console.error("Sync failed:", error);
    return { synced: false, reason: "error", error: String(error) };
  }
}

export async function fetchActivities(page = 1) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return getAthleteActivities(session.user.id, page);
}

export async function fetchActivityDetail(activityId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }
    return await getActivityDetail(session.user.id, activityId);
  } catch (error: any) {
    if (error?.status === 404) {
      return { data: null, source: "network", notFound: true } as const;
    }
    throw error;
  }
}

import { db, users, accounts, activityLists, activities } from "../db";
import { eq, and, desc } from "drizzle-orm";

const SYNC_COOLDOWN = 60 * 1000; // 1 minute

type AccountRow = typeof accounts.$inferSelect;

async function getAccount(userId: string): Promise<AccountRow | null> {
  const rows = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.providerId, "strava")));
  return rows[0] || null;
}

async function refreshAccessToken(
  userId: string,
  refreshToken?: string | null
) {
  if (!refreshToken) return null;
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  // Persist new tokens
  await db
    .update(accounts)
    .set({
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? refreshToken,
      accessTokenExpiresAt: json.expires_at
        ? new Date(json.expires_at * 1000)
        : null,
      updatedAt: new Date(),
    })
    .where(and(eq(accounts.userId, userId), eq(accounts.providerId, "strava")));
  return json.access_token as string;
}

export async function getValidAccessToken(
  userId: string
): Promise<string | null> {
  const account = await getAccount(userId);
  if (!account) return null;
  const now = Date.now();
  const expiresAt = account.accessTokenExpiresAt?.getTime() ?? 0;
  if (expiresAt && expiresAt - now < 60_000) {
    // expires within 60s -> refresh first
    const refreshed = await refreshAccessToken(userId, account.refreshToken);
    if (refreshed) return refreshed;
  }
  return account.accessToken ?? null;
}

export async function syncAthleteData(userId: string) {
  // Check cooldown from database
  const user = await db
    .select({ lastStravaSync: users.lastStravaSync })
    .from(users)
    .where(eq(users.id, userId));

  const lastSync = user[0]?.lastStravaSync?.getTime() || 0;
  const timeSinceLastSync = Date.now() - lastSync;

  if (timeSinceLastSync < SYNC_COOLDOWN) {
    const remainingTime = Math.ceil((SYNC_COOLDOWN - timeSinceLastSync) / 1000);
    return { synced: false, reason: "cooldown", remainingTime } as const;
  }

  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) {
    return { synced: false, reason: "no_token" } as const;
  }

  try {
    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // try refresh once
        const refreshed = await refreshAccessToken(
          userId,
          (
            await getAccount(userId)
          )?.refreshToken
        );
        if (refreshed) {
          const retry = await fetch("https://www.strava.com/api/v3/athlete", {
            headers: { Authorization: `Bearer ${refreshed}` },
          });
          if (!retry.ok) {
            return {
              synced: false,
              reason: "api_error",
              status: retry.status,
            } as const;
          }
          const profile = await retry.json();
          await db
            .update(users)
            .set({
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
            })
            .where(eq(users.id, userId));
          return { synced: true, reason: "success" } as const;
        }
      }
      return {
        synced: false,
        reason: "api_error",
        status: response.status,
      } as const;
    }

    const profile = await response.json();

    await db
      .update(users)
      .set({
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
      })
      .where(eq(users.id, userId));

    return { synced: true, reason: "success" } as const;
  } catch (error) {
    return { synced: false, reason: "error", error: String(error) } as const;
  }
}

// Activities list fetch with simple caching per page
export async function getAthleteActivities(
  userId: string,
  page = 1,
  perPage = 30
) {
  // check last list sync for this page
  const recent = await db
    .select()
    .from(activityLists)
    .where(and(eq(activityLists.userId, userId), eq(activityLists.page, page)))
    .orderBy(desc(activityLists.lastSynced));

  const withinCooldown =
    recent[0]?.lastSynced &&
    Date.now() - new Date(recent[0].lastSynced).getTime() < SYNC_COOLDOWN;
  if (withinCooldown) {
    return { data: recent[0].data as any[], source: "cache" } as const;
  }

  let accessToken = await getValidAccessToken(userId);
  if (!accessToken) throw new Error("Missing Strava access token");

  const url = new URL("https://www.strava.com/api/v3/athlete/activities");
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  let res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    if (res.status === 401) {
      const refreshed = await refreshAccessToken(
        userId,
        (
          await getAccount(userId)
        )?.refreshToken
      );
      if (refreshed) {
        accessToken = refreshed;
        res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    }
  }
  if (!res.ok) throw new Error(`Strava activities error ${res.status}`);
  const list = await res.json();

  // upsert list cache
  if (recent[0]) {
    await db
      .update(activityLists)
      .set({ data: list, lastSynced: new Date(), perPage })
      .where(
        and(eq(activityLists.userId, userId), eq(activityLists.page, page))
      );
  } else {
    await db
      .insert(activityLists)
      .values({ userId, data: list, page, perPage });
  }

  return { data: list as any[], source: "network" } as const;
}

export async function getActivityDetail(userId: string, activityId: string) {
  // check cached activity and ownership
  const cached = await db
    .select()
    .from(activities)
    .where(eq(activities.activityId, Number(activityId)));
  if (cached[0] && cached[0].userId === userId) {
    const freshEnough =
      cached[0].lastSynced &&
      Date.now() - new Date(cached[0].lastSynced).getTime() < SYNC_COOLDOWN;

    // Strava resource_state: 2 = summary, 3 = detailed
    const resourceState = (cached[0].data as any)?.resource_state;
    const isDetailed = resourceState === 3;

    // Only serve cache if it is detailed OR if it's fresh and detailed is not required
    if (freshEnough && isDetailed) {
      return { data: cached[0].data as any, source: "cache" } as const;
    }
    // If within cooldown but cache is only summary, proceed to fetch detailed once
  }

  let accessToken = await getValidAccessToken(userId);
  if (!accessToken) throw new Error("Missing Strava access token");
  let res = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    if (res.status === 401) {
      const refreshed = await refreshAccessToken(
        userId,
        (
          await getAccount(userId)
        )?.refreshToken
      );
      if (refreshed) {
        accessToken = refreshed;
        res = await fetch(
          `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=true`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      }
    }
  }
  if (!res.ok) throw new Error(`Strava activity error ${res.status}`);
  const detail = await res.json();

  // upsert cache, enforce ownership
  await db
    .insert(activities)
    .values({
      activityId: Number(activityId),
      userId,
      data: detail,
      lastSynced: new Date(),
    })
    .onConflictDoUpdate({
      target: activities.activityId,
      set: { data: detail, lastSynced: new Date(), userId },
    });

  return { data: detail, source: "network" } as const;
}

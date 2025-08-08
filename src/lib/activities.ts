import { db, activities, activityLists } from "@/db";
import { and, eq } from "drizzle-orm";

export async function saveActivityList(
  userId: string,
  page: number,
  list: any[],
  perPage = 30
) {
  const existing = await db
    .select()
    .from(activityLists)
    .where(and(eq(activityLists.userId, userId), eq(activityLists.page, page)));

  if (existing[0]) {
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
}

export async function loadActivityList(userId: string, page: number) {
  const rows = await db
    .select()
    .from(activityLists)
    .where(and(eq(activityLists.userId, userId), eq(activityLists.page, page)));
  return rows[0] || null;
}

export async function saveActivityDetail(
  userId: string,
  activityId: string,
  data: any
) {
  await db
    .insert(activities)
    .values({
      activityId: Number(activityId),
      userId,
      data,
      lastSynced: new Date(),
    })
    .onConflictDoUpdate({
      target: activities.activityId,
      set: { data, lastSynced: new Date(), userId },
    });
}

export async function loadActivityDetail(userId: string, activityId: string) {
  const rows = await db
    .select()
    .from(activities)
    .where(eq(activities.activityId, Number(activityId)));
  const row = rows[0];
  if (!row) return null;
  if (row.userId !== userId) return null;
  return row;
}

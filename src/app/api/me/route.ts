import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [row] = await db
    .select({
      datePreference: users.datePreference,
      measurementPreference: users.measurementPreference,
    })
    .from(users)
    .where(eq(users.id, session.user.id));

  return NextResponse.json({
    datePreference: row?.datePreference || "%m/%d/%Y",
    measurementPreference: row?.measurementPreference || "meters",
  });
}

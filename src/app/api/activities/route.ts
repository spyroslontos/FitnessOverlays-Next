import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAthleteActivities } from "@/lib/strava";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const perPage = Number(searchParams.get("perPage") || 30);

  try {
    const res = await getAthleteActivities(session.user.id, page, perPage);
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed" },
      { status: 500 }
    );
  }
}

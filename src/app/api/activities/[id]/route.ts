import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActivityDetail } from "@/lib/strava";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  // validate param
  if (!/^\d+$/.test(String(id))) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  try {
    const res = await getActivityDetail(session.user.id, id);
    return NextResponse.json(res);
  } catch (e: any) {
    const status = typeof e?.status === "number" ? e.status : 500;
    const message =
      e?.status === 404 ? "Activity not found" : e?.message || "Failed";
    return NextResponse.json({ error: message }, { status });
  }
}

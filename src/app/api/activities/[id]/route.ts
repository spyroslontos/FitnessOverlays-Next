import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActivityDetail } from "@/lib/strava";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await getActivityDetail(session.user.id, params.id);
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed" },
      { status: 500 }
    );
  }
}

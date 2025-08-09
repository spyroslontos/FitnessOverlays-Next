import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getActivityDetail } from "@/lib/strava";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(String(id))) {
    notFound();
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto p-4">
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-lg">Please sign in to view activities.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto p-4">
        <a href="/activities" className="text-sm text-blue-600 hover:underline">
          ← Back to Activities
        </a>
        <Suspense fallback={<ActivityDetailSkeleton />}>
          <ActivityDetailContent userId={session.user.id} id={id} />
        </Suspense>
      </main>
    </div>
  );
}

async function ActivityDetailContent({
  userId,
  id,
}: {
  userId: string;
  id: string;
}) {
  try {
    const res = await getActivityDetail(userId, id);
    const detail: any = res.data;
    return (
      <div className="mt-4 bg-white border rounded-lg p-4">
        <div className="flex items-baseline justify-between">
          <Badge variant="secondary">{detail.sport_type}</Badge>
          <div className="text-xs text-gray-500">
            {new Date(detail.start_date).toLocaleString()}
          </div>
        </div>
        <h1 className="mt-2 text-2xl font-semibold">
          {detail.name || "Untitled"}
        </h1>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded bg-gray-50 p-3">
            <div className="text-gray-500">Distance</div>
            <div className="font-medium">
              {(detail.distance / 1000).toFixed(2)} km
            </div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-gray-500">Moving Time</div>
            <div className="font-medium">
              {Math.round(detail.moving_time / 60)} min
            </div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-gray-500">Elev. Gain</div>
            <div className="font-medium">{detail.total_elevation_gain} m</div>
          </div>
        </div>
        <pre className="mt-6 text-xs overflow-auto bg-gray-50 p-3 rounded">
          {JSON.stringify(detail, null, 2)}
        </pre>
      </div>
    );
  } catch (e: any) {
    if (e?.status === 404) {
      return (
        <div className="mt-6">
          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="text-2xl">🏃‍♂️💨</div>
            <h2 className="mt-2 text-xl font-semibold">
              We couldn’t find that activity
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              It may not exist, or you don’t have access to view it.
            </p>
            <div className="mt-4">
              <a
                href="/activities"
                className="text-sm text-blue-600 hover:underline"
              >
                ← Back to Activities
              </a>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="mt-6">
        <div className="rounded-lg border bg-white p-6 text-center">
          <h2 className="mt-2 text-xl font-semibold">
            Failed to load activity
          </h2>
          <p className="mt-1 text-sm text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }
}

function ActivityDetailSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mt-2 h-7 w-2/3" />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    </div>
  );
}

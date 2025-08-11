import { headers } from "next/headers";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getActivityDetail } from "@/lib/strava";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginWithStravaButton } from "@/components/login-with-strava-button";
import { ActivityDetailCard } from "@/components/activity-detail-card";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto p-4">
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-lg">Please sign in to view activities.</div>
              <div className="flex items-center justify-center gap-3">
                <a href="/" className="text-sm text-blue-600 hover:underline">
                  ← Go Home
                </a>
                <LoginWithStravaButton callbackURL={`/activities/${id}`}>
                  Login with Strava
                </LoginWithStravaButton>
              </div>
            </div>
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
    if (!/^\d+$/.test(String(id))) {
      return (
        <div className="mt-6">
          <div className="rounded-lg border bg-white p-6 text-center">
            <h2 className="mt-2 text-xl font-semibold">Activity not found</h2>
            <p className="mt-1 text-sm text-gray-600">
              The requested activity does not exist.
            </p>
          </div>
        </div>
      );
    }

    const res = await getActivityDetail(userId, id);
    const detail: any = res.data;
    return <ActivityDetailCard detail={detail} />;
  } catch {
    return (
      <div className="mt-6">
        <div className="rounded-lg border bg-white p-6 text-center">
          <h2 className="mt-2 text-xl font-semibold">Activity not found</h2>
          <p className="mt-1 text-sm text-gray-600">
            You may not have access to this activity.
          </p>
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

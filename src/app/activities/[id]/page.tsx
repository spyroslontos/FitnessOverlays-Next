"use client";

import { authClient } from "@/lib/auth-client";
import { fetchActivityDetail } from "@/lib/actions";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

export default function ActivityDetailPage() {
  const { data: session, isPending } = authClient.useSession();
  const [detail, setDetail] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ id: string }>();
  const activityId = params?.id;

  useEffect(() => {
    if (!session?.user?.id || !activityId) return;
    const load = async () => {
      try {
        const res = await fetchActivityDetail(session.user.id, activityId);
        setDetail(res.data);
      } catch (e: any) {
        setError(e?.message || "Failed to load activity");
      }
    };
    load();
  }, [session?.user?.id, activityId]);

  if (isPending) return null;
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Please sign in to view this activity.</div>
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
        {error && (
          <div className="mt-4 text-sm text-red-600">Error: {error}</div>
        )}
        {!detail ? (
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
        ) : (
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
                <div className="font-medium">
                  {detail.total_elevation_gain} m
                </div>
              </div>
            </div>

            <pre className="mt-6 text-xs overflow-auto bg-gray-50 p-3 rounded">
              {JSON.stringify(detail, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}

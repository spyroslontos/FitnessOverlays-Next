"use client";

import { authClient } from "@/lib/auth-client";
import { fetchActivities } from "@/lib/actions";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { LoginWithStravaButton } from "@/components/login-with-strava-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  formatDate as formatDateByPreference,
  formatDistanceWithPref,
  paceSpeedLabel,
  formatPaceOrSpeed,
  formatDuration,
} from "@/lib/format";

type Activity = {
  id: number;
  name: string;
  start_date: string;
  sport_type: string;
  distance: number;
  moving_time: number;
};

function sportBadgeClass(sport: string) {
  switch (sport) {
    case "Run":
    case "TrailRun":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Ride":
    case "VirtualRide":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Swim":
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    case "Walk":
    case "Hike":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Rowing":
    case "Kayaking":
      return "bg-teal-100 text-teal-700 border-teal-200";
    case "Workout":
    case "WeightTraining":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function sportAccentBorderClass(sport: string) {
  switch (sport) {
    case "Run":
    case "TrailRun":
      return "border-l-orange-400";
    case "Ride":
    case "VirtualRide":
      return "border-l-blue-400";
    case "Swim":
      return "border-l-cyan-400";
    case "Walk":
    case "Hike":
      return "border-l-emerald-400";
    case "Rowing":
    case "Kayaking":
      return "border-l-teal-400";
    case "Workout":
    case "WeightTraining":
      return "border-l-purple-400";
    default:
      return "border-l-gray-300";
  }
}

export default function ActivitiesPage() {
  const { data: session, isPending } = authClient.useSession();
  const [page, setPage] = useState(1);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoading = loading && activities.length === 0;
  const [datePref, setDatePref] = useState<string>("%m/%d/%Y");
  const [measurePref, setMeasurePref] = useState<"meters" | "feet">("meters");

  useEffect(() => {
    if (!session?.user?.id) return;
    // fetch preferences once
    (async () => {
      try {
        const res = await fetch("/api/preferences");
        if (res.ok) {
          const json = await res.json();
          if (json.datePreference) setDatePref(json.datePreference);
          if (json.measurementPreference)
            setMeasurePref(
              json.measurementPreference === "feet" ? "feet" : "meters"
            );
        }
      } catch {}
    })();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchActivities(page);
        setActivities((prev) =>
          page === 1 ? res.data : [...prev, ...res.data]
        );
      } catch (e: any) {
        setError(e?.message || "Failed to load activities");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session?.user?.id, page]);

  if (isPending)
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Loading session...</div>
            <Button asChild variant="outline">
              <a href="/activities/demo">Try Demo</a>
            </Button>
          </div>
        </main>
      </div>
    );
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto p-4">
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-lg">Please sign in to view activities.</div>
              <div className="flex items-center justify-center gap-3">
                <Button asChild variant="outline">
                  <a href="/">Go Home</a>
                </Button>
                <LoginWithStravaButton callbackURL="/activities" />
                <Button asChild variant="outline">
                  <a href="/activities/demo">Try Demo</a>
                </Button>
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
      <main className="max-w-5xl mx-auto p-4">
        <h2 className="text-2xl font-semibold mb-4">Your Activities</h2>

        {error && (
          <div className="mb-4 text-sm text-red-600">Error: {error}</div>
        )}

        {isInitialLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-white p-4">
                <div className="flex items-baseline justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="mt-2 h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {activities.map((a) => (
            <a
              key={a.id}
              href={`/activities/${a.id}`}
              className={`block rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition border-l-4 ${sportAccentBorderClass(
                a.sport_type
              )}`}
            >
              <header className="flex items-baseline justify-between">
                <Badge className={sportBadgeClass(a.sport_type)}>
                  {a.sport_type}
                </Badge>
                <div className="text-xs text-gray-500">
                  {formatDateByPreference(a.start_date, datePref)}
                </div>
              </header>
              <div className="mt-2 font-medium text-base truncate">
                {a.name || "Untitled"}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <div className="text-[10px] uppercase text-gray-500">
                    Distance
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {formatDistanceWithPref(a.distance, measurePref)}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-[10px] uppercase text-gray-500">
                    Duration
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {formatDuration(a.moving_time)}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-[10px] uppercase text-gray-500">
                    {paceSpeedLabel(a)}
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {formatPaceOrSpeed(a, measurePref)}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={() => setPage((p) => p + 1)} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      </main>
    </div>
  );
}

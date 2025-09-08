"use client";

import { useState, useEffect } from "react";
import { fetchActivities } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LoginWithStravaButton } from "@/components/login-with-strava-button";
import { authClient } from "@/lib/auth-client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
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

interface MobileSidebarProps {
  onActivitySelect: (activity: Activity) => void;
}

interface MobileSidebarTriggerProps {
  onActivitySelect: (activity: Activity) => void;
}

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

export function MobileSidebarTrigger({
  onActivitySelect,
}: MobileSidebarTriggerProps) {
  const { data: session } = authClient.useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [datePref, setDatePref] = useState<string>("%m/%d/%Y");
  const [measurePref, setMeasurePref] = useState<"meters" | "feet">("meters");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Fetch preferences only if logged in
    if (session?.user) {
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
    }

    const loadActivities = async () => {
      if (session?.user) {
        // Logged in - fetch real activities
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
      } else {
        // Not logged in - fetch demo activities from public folder
        try {
          const response = await fetch("/demo/activity_demo.json");
          if (response.ok) {
            const demoData = await response.json();
            // Create a simple activities list from the demo data
            const demoActivities = [
              {
                id: demoData.id,
                name: demoData.name,
                start_date: demoData.start_date,
                sport_type: demoData.sport_type,
                distance: demoData.distance,
                moving_time: demoData.moving_time,
              },
            ];
            setActivities(demoActivities);
          } else {
            setActivities([]);
          }
        } catch (error) {
          console.error("Failed to load demo data:", error);
          setActivities([]);
        }
      }
    };

    loadActivities();
  }, [page, session?.user]);

  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

  const handleActivityClick = (activity: Activity) => {
    onActivitySelect(activity);
    setOpen(false); // Close sidebar after selection
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open activities menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>{session?.user ? "Your Activities" : "Demo Activities"}</span>
            {!session?.user && <LoginWithStravaButton callbackURL="/app" />}
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 overflow-y-auto h-full">
          {!session?.user && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Viewing demo data. Sign in to see your real activities.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 text-sm text-red-600">Error: {error}</div>
          )}

          {loading && activities.length === 0 && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => handleActivityClick(activity)}
                className={`w-full text-left rounded-lg border p-3 hover:shadow-md transition border-l-4 ${sportAccentBorderClass(
                  activity.sport_type
                )}`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <Badge className={sportBadgeClass(activity.sport_type)}>
                    {activity.sport_type}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    {formatDateByPreference(activity.start_date, datePref)}
                  </div>
                </div>

                <div className="font-medium text-sm truncate mb-2">
                  {activity.name || "Untitled"}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex flex-col">
                    <div className="text-[10px] uppercase text-gray-500">
                      Distance
                    </div>
                    <div className="font-semibold text-gray-800">
                      {formatDistanceWithPref(activity.distance, measurePref)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-[10px] uppercase text-gray-500">
                      Duration
                    </div>
                    <div className="font-semibold text-gray-800">
                      {formatDuration(activity.moving_time)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-[10px] uppercase text-gray-500">
                      {paceSpeedLabel(activity)}
                    </div>
                    <div className="font-semibold text-gray-800">
                      {formatPaceOrSpeed(activity, measurePref)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {activities.length > 0 && session?.user && (
            <div className="mt-4">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

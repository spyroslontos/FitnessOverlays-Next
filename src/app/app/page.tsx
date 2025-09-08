"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LoginWithStravaButton } from "@/components/login-with-strava-button";
import { Header } from "@/components/header";
import { AppSidebar } from "../../components/app-sidebar";
import { MobileSidebarTrigger } from "../../components/mobile-sidebar";
import { ActivityDetailCard } from "@/components/activity-detail-card";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type Activity = {
  id: number;
  name: string;
  start_date: string;
  sport_type: string;
  distance: number;
  moving_time: number;
};

type ActivityDetail = any;

// Client-side cache for activity details with TTL
const activityCache = new Map<
  string,
  { data: ActivityDetail; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function AppPage() {
  const { data: session, isPending } = authClient.useSession();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [activityDetail, setActivityDetail] = useState<ActivityDetail | null>(
    null
  );
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleActivitySelect = async (activity: Activity) => {
    setSelectedActivity(activity);

    // Check cache first with TTL
    const cacheKey = `${activity.id}`;
    const cached = activityCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setActivityDetail(cached.data);
      return;
    }

    setLoadingDetail(true);

    try {
      if (session?.user) {
        // Logged in - use server action (this is correct for server actions)
        const { fetchActivityDetail } = await import("@/lib/actions");
        const result = await fetchActivityDetail(activity.id.toString());
        activityCache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now(),
        });
        setActivityDetail(result.data);
      } else {
        // Not logged in - fetch demo data from public folder (client-side fetch)
        const response = await fetch("/demo/activity_demo.json");
        if (response.ok) {
          const demoData = await response.json();
          activityCache.set(cacheKey, {
            data: demoData,
            timestamp: Date.now(),
          });
          setActivityDetail(demoData);
        } else {
          setActivityDetail(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch activity detail:", error);
      setActivityDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <div className="w-64 border-r bg-white p-4">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        mobileSidebarTrigger={
          <MobileSidebarTrigger onActivitySelect={handleActivitySelect} />
        }
      />
      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar onActivitySelect={handleActivitySelect} />
        </div>

        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold">Activity Details</h1>
              {!session?.user && (
                <div className="text-sm text-gray-500">Demo Mode</div>
              )}
            </div>

            {!selectedActivity ? (
              <div className="bg-white border rounded-lg p-8 text-center">
                <p className="text-gray-600">
                  Select an activity from the sidebar to view details
                </p>
                {!session?.user && (
                  <p className="text-sm text-gray-500 mt-2">
                    Demo data available - sign in to see your real activities
                  </p>
                )}
              </div>
            ) : loadingDetail ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : activityDetail ? (
              <ActivityDetailCard detail={activityDetail} />
            ) : (
              <div className="bg-white border rounded-lg p-8 text-center">
                <p className="text-red-600">Failed to load activity details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

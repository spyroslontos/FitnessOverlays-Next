"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ActivityTile } from "./activity-tile";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivitiesList() {
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null
  );

  const { isPending, error, data } = useQuery({
    queryKey: ["activityData"],
    queryFn: () => fetch("/api/activities").then((res) => res.json()),
  });

  const activities = Array.isArray(data) ? data : [];
  const latestActivity = activities.length > 0 ? activities[0] : null;

  // Set initial selection on data load
  useEffect(() => {
    if (latestActivity) {
      const persisted = localStorage.getItem("selectedActivityId");
      const timestamp = localStorage.getItem("selectedActivityTimestamp");
      const oneDay = 24 * 60 * 60 * 1000;

      const shouldUseLatest =
        !persisted || !timestamp || Date.now() - Number(timestamp) >= oneDay;
      const activityId = shouldUseLatest
        ? latestActivity.id
        : Number(persisted);

      setSelectedActivityId(activityId);
      localStorage.setItem("selectedActivityId", activityId.toString());
      localStorage.setItem("selectedActivityTimestamp", Date.now().toString());
      window.dispatchEvent(
        new CustomEvent("activitySelected", { detail: activityId })
      );
    }
  }, [latestActivity]);

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Activities ({activities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isPending ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : error ? (
            <div className="text-sm text-destructive">
              Error loading activities
            </div>
          ) : (
            activities.map((activity: any, index: number) => (
              <div key={activity.id} className="relative">
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  {index === 0 && <Badge variant="secondary">Latest</Badge>}
                  {selectedActivityId === activity.id && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>
                <ActivityTile
                  activity={activity}
                  onClick={(id) => {
                    setSelectedActivityId(id);
                    localStorage.setItem("selectedActivityId", id.toString());
                    localStorage.setItem(
                      "selectedActivityTimestamp",
                      Date.now().toString()
                    );
                    window.dispatchEvent(
                      new CustomEvent("activitySelected", { detail: id })
                    );
                  }}
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

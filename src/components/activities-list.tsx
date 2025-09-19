"use client";

import { useQuery } from "@tanstack/react-query";
import { ActivityTile } from "./activity-tile";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function ActivitiesList() {
  const { isPending, error, data } = useQuery({
    queryKey: ["activityData"],
    queryFn: () => fetch("/api/activities").then((res) => res.json()),
  });

  const activities = Array.isArray(data) ? data : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activities ({activities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isPending ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded" />
            ))
          ) : error ? (
            <div className="text-sm text-destructive">
              Error loading activities
            </div>
          ) : (
            activities.map((activity: any) => (
              <ActivityTile
                key={activity.id}
                activity={activity}
                onClick={(id) => {
                  window.dispatchEvent(
                    new CustomEvent("activitySelected", { detail: id })
                  );
                }}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

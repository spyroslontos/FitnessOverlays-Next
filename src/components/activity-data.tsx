"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function ActivityData() {
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null
  );

  const { isPending, error, data } = useQuery({
    queryKey: ["activityData", selectedActivityId],
    queryFn: () =>
      fetch(`/api/activities/${selectedActivityId}`).then((res) => res.json()),
    enabled: !!selectedActivityId,
  });

  // Listen for activity selection from sidebar
  useEffect(() => {
    const handleActivitySelect = (event: CustomEvent) => {
      setSelectedActivityId(event.detail);
    };

    window.addEventListener(
      "activitySelected",
      handleActivitySelect as EventListener
    );
    return () =>
      window.removeEventListener(
        "activitySelected",
        handleActivitySelect as EventListener
      );
  }, []);

  if (!selectedActivityId) {
    return (
      <div className="p-4 border rounded">
        <h3 className="font-bold mb-2">Activity Data</h3>
        <p className="text-sm text-muted-foreground">
          Select an activity to view details
        </p>
      </div>
    );
  }

  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Activity Data</h3>
      {isPending ? (
        <div>Loading activity data...</div>
      ) : (
        <pre className="text-xs p-2 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

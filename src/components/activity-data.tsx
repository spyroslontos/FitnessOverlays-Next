"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivityData() {
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null
  );

  const { isPending, error, data } = useQuery({
    queryKey: ["activityData", selectedActivityId],
    queryFn: () =>
      fetch(`/api/activities/${selectedActivityId}`).then((res) => res.json()),
    enabled: !!selectedActivityId,
    staleTime: 3 * 60 * 1000, // 3 minutes - matches server cache
    gcTime: 3 * 60 * 1000, // 3 minutes - garbage collect after 3 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Load selected activity from localStorage and listen for changes
  useEffect(() => {
    const updateSelection = () => {
      const persisted = localStorage.getItem("selectedActivityId");
      if (persisted) {
        setSelectedActivityId(Number(persisted));
      }
    };

    // Initial load
    updateSelection();

    // Listen for storage changes
    window.addEventListener("storage", updateSelection);

    // Listen for custom events from ActivitiesList
    const handleActivitySelect = (event: CustomEvent) => {
      setSelectedActivityId(event.detail);
    };

    window.addEventListener(
      "activitySelected",
      handleActivitySelect as EventListener
    );

    return () => {
      window.removeEventListener("storage", updateSelection);
      window.removeEventListener(
        "activitySelected",
        handleActivitySelect as EventListener
      );
    };
  }, []);

  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="p-4 border rounded-lg">
      {isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <pre className="text-xs p-2 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

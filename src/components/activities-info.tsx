"use client";

import { useQuery } from "@tanstack/react-query";

export function ActivitiesInfo() {
  const { isPending, error, data } = useQuery({
    queryKey: ["activityData"],
    queryFn: () => fetch("/api/activities").then((res) => res.json()),
  });

  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Activities Data</h3>
      {isPending ? (
        <div>Loading activities data...</div>
      ) : (
        <pre className="text-xs p-2 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

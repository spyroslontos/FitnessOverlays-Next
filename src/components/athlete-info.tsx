"use client";

import { useQuery } from "@tanstack/react-query";

export function AthleteInfo() {
  const { isPending, error, data } = useQuery({
    queryKey: ["athleteData"],
    queryFn: () => fetch("/api/athlete").then((res) => res.json()),
  });
  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Athlete Data</h3>
      {isPending ? (
        <div>Loading athlete data...</div>
      ) : (
        <pre className="text-xs p-2 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

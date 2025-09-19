"use client";

import { useQuery } from "@tanstack/react-query";

export function AthleteInfo() {
  const { isPending, error, data } = useQuery({
    queryKey: ["athleteData"],
    queryFn: () => fetch("/api/athlete").then((res) => res.json()),
  });

  if (data) {
    console.log("Athlete Data:", data);
  }

  if (error) return "An error has occurred: " + error.message;

  return;
}

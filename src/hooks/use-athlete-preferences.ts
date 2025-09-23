"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { UnitSystem, mapStravaUnitsToUnitSystem } from "@/lib/metrics"

export interface AthletePreferences {
  datePreference: string
  measurementPreference: string
  unitSystem: UnitSystem
}

export function useAthletePreferences() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ["athletePreferences"],
    queryFn: async (): Promise<AthletePreferences> => {
      const response = await fetch("/api/athlete")
      if (!response.ok) {
        throw new Error("Failed to fetch athlete data")
      }
      const data = await response.json()
      
      // Map Strava measurement preference to our unit system
      const unitSystem = mapStravaUnitsToUnitSystem(data.measurement_preference)
      
      return {
        datePreference: unitSystem === "metric" ? "%b %d, %Y" : "%m/%d/%Y",
        measurementPreference: data.measurement_preference || "meters",
        unitSystem,
      }
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

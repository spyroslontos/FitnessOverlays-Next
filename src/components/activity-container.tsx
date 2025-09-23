"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { OverlayCanvas } from "./overlay-canvas"
import { MetricControls } from "./metric-controls"
import { Skeleton } from "@/components/ui/skeleton"
import { UnitSystem } from "@/lib/metrics"
import { useAthletePreferences } from "@/hooks/use-athlete-preferences"

interface ActivityContainerProps {
  data?: any
  isPending?: boolean
}

export function ActivityContainer({ data, isPending }: ActivityContainerProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>([
    "distance",
    "time",
    "pace",
    "avgSpeed",
  ])
  const { data: athletePreferences } = useAthletePreferences()
  
  // Use athlete preferences for unit system, fallback to metric
  const unitSystem: UnitSystem = athletePreferences?.unitSystem || "metric"

  // Load selected metrics from localStorage on mount
  useEffect(() => {
    const savedMetrics = localStorage.getItem("selectedMetrics")
    if (savedMetrics) {
      try {
        const parsedMetrics = JSON.parse(savedMetrics)
        if (Array.isArray(parsedMetrics)) {
          setVisibleMetrics(parsedMetrics)
        }
      } catch (error) {
        console.warn("Failed to parse saved metrics:", error)
      }
    }
  }, [])

  const handleMetricsChange = (metrics: string[]) => {
    setVisibleMetrics(metrics)
    localStorage.setItem("selectedMetrics", JSON.stringify(metrics))
  }

  return (
    <div className="space-y-4">
      <OverlayCanvas
        visibleMetrics={visibleMetrics}
        data={data}
        unitSystem={unitSystem}
        isPending={isPending}
      />
      <MetricControls
        onMetricsChange={handleMetricsChange}
        selectedMetrics={visibleMetrics}
        activityData={data}
      />
      <div className="p-4 border rounded-lg">
        {isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <pre className="text-xs p-2 rounded overflow-auto h-50 max-h-50">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

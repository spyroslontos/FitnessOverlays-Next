"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { OverlayCanvas } from "./overlay-canvas"
import { MetricControls } from "./metric-controls"
import { UnitSystem } from "@/lib/metrics"
import { useAthletePreferences } from "@/hooks/use-athlete-preferences"

interface ActivityContainerProps {
  data?: any
  isPending?: boolean
}

export function OverlayWorkspace({ data, isPending }: ActivityContainerProps) {
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
    <div className="flex flex-col h-full min-h-[300px] sm:min-h-[500px]">
      <OverlayCanvas
        visibleMetrics={visibleMetrics}
        data={data}
        unitSystem={unitSystem}
        isPending={isPending}
        className="flex-1"
      />
      <div className="pt-2 flex gap-2">
        <MetricControls
          onMetricsChange={handleMetricsChange}
          selectedMetrics={visibleMetrics}
          activityData={data}
        />
      </div>
    </div>
  )
}

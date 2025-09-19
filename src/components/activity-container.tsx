"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { OverlayCanvas } from "./overlay-canvas"
import { MetricControls } from "./metric-controls"
import { Skeleton } from "@/components/ui/skeleton"
import { UnitSystem } from "@/lib/metrics"

export function ActivityContainer() {
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null
  )
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>([
    "distance",
    "time",
    "pace",
    "avgSpeed",
  ])
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric")

  const { data, isPending } = useQuery({
    queryKey: ["activityData", selectedActivityId],
    queryFn: () =>
      fetch(`/api/activities/${selectedActivityId}`).then((res) => res.json()),
    enabled: !!selectedActivityId,
  })

  useEffect(() => {
    const updateSelection = () => {
      const persisted = localStorage.getItem("selectedActivityId")
      if (persisted) setSelectedActivityId(Number(persisted))
    }
    updateSelection()
    window.addEventListener("storage", updateSelection)
    const handleActivitySelect = (event: CustomEvent) =>
      setSelectedActivityId(event.detail)
    window.addEventListener(
      "activitySelected",
      handleActivitySelect as EventListener
    )
    return () => {
      window.removeEventListener("storage", updateSelection)
      window.removeEventListener(
        "activitySelected",
        handleActivitySelect as EventListener
      )
    }
  }, [])

  const handleMetricsChange = (metrics: string[]) => {
    setVisibleMetrics(metrics)
  }

  const handleUnitSystemChange = (unitSystem: UnitSystem) => {
    setUnitSystem(unitSystem)
  }

  return (
    <div className="space-y-4">
      <OverlayCanvas
        visibleMetrics={visibleMetrics}
        data={data}
        unitSystem={unitSystem}
      />
      <MetricControls
        onMetricsChange={handleMetricsChange}
        onUnitSystemChange={handleUnitSystemChange}
        unitSystem={unitSystem}
        selectedMetrics={visibleMetrics}
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

"use client"

import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RotateCcw } from "lucide-react"
import { METRICS, UnitSystem, DEFAULT_METRICS } from "@/lib/metrics"
import { useAthletePreferences } from "@/hooks/use-athlete-preferences"

interface MetricControlsProps {
  onMetricsChange: (metrics: string[]) => void
  selectedMetrics: string[]
  activityData?: any
}

export function MetricControls({
  onMetricsChange,
  selectedMetrics,
  activityData,
}: MetricControlsProps) {
  const { data: athletePreferences } = useAthletePreferences()
  
  // Filter metrics to only show those with actual data
  const availableMetrics = METRICS.filter((metric) => {
    if (!activityData) return true // Show all if no data yet
    
    const unitSystem = athletePreferences?.unitSystem || "metric"
    const result = metric.formatter(activityData, unitSystem)
    return result !== "N/A"
  })
  
  const toggleMetric = (metricKey: string, pressed: boolean) => {
    onMetricsChange(
      pressed
        ? [...selectedMetrics, metricKey]
        : selectedMetrics.filter((m) => m !== metricKey),
    )
  }

  const resetToDefaults = () => {
    onMetricsChange(DEFAULT_METRICS)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Metrics
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start" side="top">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Select Metrics</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="text-xs h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {availableMetrics.map((metric) => (
              <Toggle
                key={metric.key}
                pressed={selectedMetrics.includes(metric.key)}
                onPressedChange={(pressed) => toggleMetric(metric.key, pressed)}
                size="sm"
                variant="outline"
                className="text-sm whitespace-nowrap px-3 py-2 h-auto w-auto min-w-fit data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=on]:border-green-600"
              >
                {metric.label}
              </Toggle>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

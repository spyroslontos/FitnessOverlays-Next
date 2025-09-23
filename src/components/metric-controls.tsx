"use client"

import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { METRICS, UnitSystem } from "@/lib/metrics"
import { useAthletePreferences } from "@/hooks/use-athlete-preferences"

interface MetricControlsProps {
  onMetricsChange: (metrics: string[]) => void
  selectedMetrics: string[]
}

export function MetricControls({
  onMetricsChange,
  selectedMetrics,
}: MetricControlsProps) {
  const { data: athletePreferences } = useAthletePreferences()
  
  const toggleMetric = (metricKey: string, pressed: boolean) => {
    onMetricsChange(
      pressed
        ? [...selectedMetrics, metricKey]
        : selectedMetrics.filter((m) => m !== metricKey),
    )
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
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {METRICS.map((metric) => (
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

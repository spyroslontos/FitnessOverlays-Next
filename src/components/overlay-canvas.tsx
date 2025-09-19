"use client"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { getMetricByKey, UnitSystem } from "@/lib/metrics"

interface OverlayCanvasProps {
  visibleMetrics?: string[]
  data?: any
  unitSystem?: UnitSystem
}

export function OverlayCanvas({
  visibleMetrics = [],
  data,
  unitSystem = "metric",
}: OverlayCanvasProps) {
  if (!data) return null

  return (
    <div className="w-full">
      <AspectRatio ratio={1 / 1} className="bg-gray-50 rounded-lg">
        <div
          className="flex flex-col justify-center items-center h-full w-full p-4"
          style={{ fontSize: "clamp(0.5rem, 3vh, 1.5rem)" }}
        >
          {visibleMetrics.map((key) => {
            const metric = getMetricByKey(key)
            return metric ? (
              <div key={key} className="text-center mb-1">
                <div className="text-gray-600" style={{ fontSize: "0.8em" }}>
                  {metric.label}
                </div>
                <div className="font-semibold">
                  {metric.formatter(data, unitSystem)}
                </div>
              </div>
            ) : null
          })}
        </div>
      </AspectRatio>
    </div>
  )
}

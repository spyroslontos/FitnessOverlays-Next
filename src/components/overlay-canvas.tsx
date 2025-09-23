"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { getMetricByKey, UnitSystem } from "@/lib/metrics"
import { useSession } from "next-auth/react"

interface OverlayCanvasProps {
  visibleMetrics?: string[]
  data?: any
  unitSystem?: UnitSystem
  isPending?: boolean
  className?: string
}

export function OverlayCanvas({
  visibleMetrics = [],
  data,
  unitSystem = "metric",
  isPending = false,
  className = "",
}: OverlayCanvasProps) {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div 
        className={`w-full h-full min-h-[200px] sm:min-h-[400px] bg-gray-50 rounded-lg flex flex-col justify-center items-center p-4 ${className}`}
        style={{ fontSize: "clamp(1rem, 3vh, 1.8rem)" }}
      >
        <div className="text-center text-gray-600 text-xl">Not Authenticated</div>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className={`w-full h-full min-h-[200px] sm:min-h-[400px] bg-gray-50 rounded-lg flex flex-col justify-center items-center p-4 space-y-2 ${className}`}>
        {visibleMetrics.map((_, i) => (
          <div key={i} className="text-center space-y-1 w-full">
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div 
      className={`w-full h-full min-h-[200px] sm:min-h-[400px] bg-gray-50 rounded-lg flex flex-col justify-center items-center p-4 ${className}`}
      style={{ fontSize: "clamp(1rem, 3vh, 1.8rem)" }}
    >
      {visibleMetrics.map((key) => {
        const metric = getMetricByKey(key)
        return metric ? (
          <div key={key} className="text-center mb-2">
            <div className="text-gray-600" style={{ fontSize: "0.85em" }}>
              {metric.label}
            </div>
            <div className="font-semibold text-lg">
              {metric.formatter(data, unitSystem)}
            </div>
          </div>
        ) : null
      })}
    </div>
  )
}

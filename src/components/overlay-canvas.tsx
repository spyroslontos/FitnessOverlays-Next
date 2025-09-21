"use client"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Skeleton } from "@/components/ui/skeleton"
import { getMetricByKey, UnitSystem } from "@/lib/metrics"
import { useSession } from "next-auth/react"

interface OverlayCanvasProps {
  visibleMetrics?: string[]
  data?: any
  unitSystem?: UnitSystem
  isPending?: boolean
}

export function OverlayCanvas({
  visibleMetrics = [],
  data,
  unitSystem = "metric",
  isPending = false,
}: OverlayCanvasProps) {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="w-full">
        <AspectRatio ratio={1 / 1} className="bg-gray-50 rounded-lg">
          <div
            className="flex flex-col justify-center items-center h-full w-full p-4"
            style={{ fontSize: "clamp(0.5rem, 3vh, 1.5rem)" }}
          >
            <div className="text-center text-gray-600">Not Authenticated</div>
          </div>
        </AspectRatio>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="w-full">
        <AspectRatio ratio={1 / 1} className="bg-gray-50 rounded-lg">
          <div className="flex flex-col justify-center items-center h-full w-full p-4 space-y-2">
            {visibleMetrics.map((_, i) => (
              <div key={i} className="text-center space-y-1 w-full">
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </AspectRatio>
      </div>
    )
  }

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

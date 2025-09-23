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
  const { data: session, status } = useSession()

  const baseClassName = `w-full h-full min-h-[200px] sm:min-h-[400px] rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col justify-center items-center p-4 ${className}`
  
  const checkerboardStyle = {
    backgroundColor: '#4a4a4a',
    backgroundImage: `
      linear-gradient(45deg, #333333 25%, transparent 25%),
      linear-gradient(-45deg, #333333 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #333333 75%),
      linear-gradient(-45deg, transparent 75%, #333333 75%)
    `,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
  }
  
  // Show skeleton while loading
  if (status === "loading" || (session && isPending)) {
    return (
      <div className={`${baseClassName} space-y-2`} style={checkerboardStyle}>
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
      className={baseClassName}
      style={{ 
        fontSize: "clamp(1rem, 3vh, 1.8rem)",
        ...checkerboardStyle
      }}
    >
      {!session ? (
        <div className="text-center text-white text-xl drop-shadow-lg">Not Authenticated</div>
      ) : (
        visibleMetrics.map((key) => {
          const metric = getMetricByKey(key)
          return metric ? (
            <div key={key} className="text-center mb-2">
              <div className="text-white drop-shadow-lg" style={{ fontSize: "0.85em" }}>
                {metric.label}
              </div>
              <div className="font-semibold text-lg text-white drop-shadow-lg">
                {metric.formatter(data, unitSystem)}
              </div>
            </div>
          ) : null
        })
      )}
    </div>
  )
}

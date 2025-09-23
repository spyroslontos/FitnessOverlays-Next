"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { getMetricByKey, UnitSystem } from "@/lib/metrics"
import { useSession } from "next-auth/react"

type Alignment = 'left' | 'center' | 'right'
type Size = 'small' | 'medium' | 'large'

interface OverlayCanvasProps {
  visibleMetrics?: string[]
  data?: any
  unitSystem?: UnitSystem
  isPending?: boolean
  className?: string
  alignment?: Alignment
  labelSize?: Size
  valueSize?: Size
  columns?: number
  fontFamily?: string
  textColor?: string
}

export function OverlayCanvas({
  visibleMetrics = [],
  data,
  unitSystem = "metric",
  isPending = false,
  className = "",
  alignment = "center",
  labelSize = "medium",
  valueSize = "medium",
  columns = 1,
  fontFamily = 'Poppins',
  textColor = '#ffffff',
}: OverlayCanvasProps) {
  const { data: session, status } = useSession()

  const STYLES = {
    baseClassName: `w-full h-full min-h-[200px] sm:min-h-[400px] rounded-lg border bg-card text-card-foreground shadow-sm ${className}`,
    checkerboard: {
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
  }

  const CONFIG = {
    fontSizes: { 
      label: { small: 'text-sm', medium: 'text-base', large: 'text-lg' }, 
      value: { small: 'text-lg', medium: 'text-xl', large: 'text-2xl' } 
    },
    alignment: { left: 'left', center: 'center', right: 'right' }
  }

  const getAlignmentClass = (align: Alignment) => {
    switch (align) {
      case 'left': return 'text-left items-start'
      case 'right': return 'text-right items-end'
      default: return 'text-center items-center'
    }
  }

  const getSizeClass = (size: Size, type: 'label' | 'value') => {
    // Ensure we have valid size values with fallbacks
    const validSize = size && ['small', 'medium', 'large'].includes(size) ? size : 'medium'
    return CONFIG.fontSizes[type][validSize]
  }

  // Show skeleton while loading
  if (status === "loading" || (session && isPending)) {
    return (
      <div className={`${STYLES.baseClassName} flex items-center justify-center`} style={STYLES.checkerboard}>
        <div className="space-y-2">
          {visibleMetrics.map((_, i) => (
            <div key={i} className="text-center space-y-1 w-full">
              <Skeleton className="h-3 w-16 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className={STYLES.baseClassName} style={STYLES.checkerboard}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white text-xl drop-shadow-lg">Not Authenticated</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={STYLES.baseClassName} style={STYLES.checkerboard}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white text-xl drop-shadow-lg">No Activity Selected</div>
        </div>
      </div>
    )
  }

  const rowsPerColumn = Math.ceil(visibleMetrics.length / columns)
  const gridCols = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-4'

  return (
    <div className={STYLES.baseClassName} style={STYLES.checkerboard}>
      <div className={`grid ${gridCols} gap-4 h-full p-4`}>
        {visibleMetrics.map((key, i) => {
          const metric = getMetricByKey(key)
          if (!metric) return null
          
          const col = i % columns
          const row = Math.floor(i / columns)
          
          return (
            <div 
              key={key}
              className={`flex flex-col justify-center space-y-1 ${getAlignmentClass(alignment)}`}
              style={{ 
                fontFamily,
                color: textColor,
                gridColumn: col + 1,
                gridRow: row + 1
              }}
            >
              <div 
                className={`font-normal ${getSizeClass(labelSize, 'label')}`}
              >
                {metric.label}
              </div>
              <div 
                className={`font-bold ${getSizeClass(valueSize, 'value')}`}
              >
                {metric.formatter(data, unitSystem)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

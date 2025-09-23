"use client"

import { useEffect, useRef } from "react"
import * as fabric from "fabric"
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)

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

  useEffect(() => {
    if (!canvasRef.current || !session || !data) return

    const canvas = new fabric.Canvas(canvasRef.current, { 
      width: canvasRef.current.offsetWidth, 
      height: canvasRef.current.offsetHeight, 
      backgroundColor: 'transparent', 
      selection: false, 
      interactive: false 
    })
    fabricCanvasRef.current = canvas

    const CONFIG = {
      fontSizes: { label: { small: 14, medium: 16, large: 20 }, value: { small: 20, medium: 24, large: 28 } },
      alignment: { left: 'left', center: 'center', right: 'right' }
    }

    const createText = (text: string, x: number, y: number, fontSize: number, isBold = false) => 
      new fabric.Text(text, { 
        left: x, 
        top: y, 
        originX: CONFIG.alignment[alignment] as fabric.TOriginX, 
        originY: 'center', 
        fontSize, 
        fill: textColor, 
        fontFamily,
        fontWeight: isBold ? 'bold' : 'normal'
      })

    const renderCanvas = () => {
      const rowsPerColumn = Math.ceil(visibleMetrics.length / columns)
      
      visibleMetrics.forEach((key, i) => {
        const metric = getMetricByKey(key)
        if (!metric) return
        
        const col = i % columns
        const row = Math.floor(i / columns)
        const colWidth = canvas.getWidth() / columns
        const rowHeight = canvas.getHeight() / rowsPerColumn
        const x = col * colWidth + colWidth / 2
        const y = row * rowHeight + rowHeight / 2
        
        canvas.add(createText(metric.label, x, y - 15, CONFIG.fontSizes.label[labelSize]))
        canvas.add(createText(metric.formatter(data, unitSystem), x, y + 15, CONFIG.fontSizes.value[valueSize], true))
      })
      canvas.renderAll()
    }

    renderCanvas()
    
    return () => {
      canvas.dispose()
    }
  }, [visibleMetrics, data, unitSystem, session, alignment, labelSize, valueSize, columns, fontFamily, textColor])

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

  return (
    <div className={STYLES.baseClassName} style={STYLES.checkerboard}>
      {!session ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white text-xl drop-shadow-lg">Not Authenticated</div>
        </div>
      ) : (
        <canvas ref={canvasRef} className="w-full h-full" />
      )}
    </div>
  )
}

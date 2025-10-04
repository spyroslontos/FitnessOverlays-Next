"use client"

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react"
import { Canvas, FabricText, TOriginX, TOriginY } from "fabric"
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

export interface OverlayCanvasRef {
  exportToPNG: () => string | null
  getCanvas: () => Canvas | null
}

const FONT_SIZES = { 
  label: { small: 12, medium: 16, large: 20 }, 
  value: { small: 18, medium: 24, large: 32 } 
}

const TEXT_GAP = 4 // Gap between label and value

// Helper functions
const getSizeValue = (size: Size, type: 'label' | 'value') => {
  const validSize = ['small', 'medium', 'large'].includes(size) ? size : 'medium'
  return FONT_SIZES[type][validSize]
}

const createText = (
  text: string,
  x: number,
  y: number,
  options: {
    fontSize: number
    fontFamily: string
    fill: string
    fontWeight?: string
    originX: TOriginX
    originY: TOriginY
  }
) => new FabricText(text, {
  left: x,
  top: y,
  ...options,
  selectable: false,
  evented: false,
})

const drawCheckerboard = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const squareSize = 10
  ctx.fillStyle = '#4a4a4a'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#333333'
  for (let i = 0; i < width; i += squareSize * 2) {
    for (let j = 0; j < height; j += squareSize * 2) {
      ctx.fillRect(i, j, squareSize, squareSize)
      ctx.fillRect(i + squareSize, j + squareSize, squareSize, squareSize)
    }
  }
}

const OverlayCanvasComponent = forwardRef<OverlayCanvasRef, OverlayCanvasProps>(({
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
}, ref) => {
  const { data: session, status } = useSession()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const [canvasReady, setCanvasReady] = useState(false)

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    exportToPNG: () => {
      const canvas = fabricRef.current
      if (!canvas) return null
      
      // Temporarily remove checkerboard background
      const originalBg = canvas.backgroundColor
      canvas.backgroundColor = 'transparent'
      canvas.renderAll()
      
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2, // 2x resolution for better quality
      })
      
      // Restore background
      canvas.backgroundColor = originalBg
      canvas.renderAll()
      
      return dataURL
    },
    getCanvas: () => fabricRef.current
  }))

  // Initialize canvas and setup background rendering
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || fabricRef.current) return

    const container = containerRef.current
    
    const initCanvas = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(rect.width || 800, 100)
      const height = Math.max(rect.height || 600, 100)

      const canvas = new Canvas(canvasRef.current!, { 
        width, 
        height,
        backgroundColor: '#4a4a4a',
      })
      
      fabricRef.current = canvas

      // Setup checkerboard rendering  
      const originalRenderAll = canvas.renderAll.bind(canvas)
      canvas.renderAll = function() {
        const ctx = this.getContext()
        if (ctx) {
          drawCheckerboard(ctx, this.width || 800, this.height || 600)
        }
        originalRenderAll()
        return this
      }

      // Use ResizeObserver for better resize handling
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          if (width > 0 && height > 0) {
            canvas.setDimensions({ width, height })
            canvas.renderAll()
          }
        }
      })

      resizeObserver.observe(container)
      
      setCanvasReady(true)
      canvas.renderAll()

      return () => {
        resizeObserver.disconnect()
        canvas.dispose()
        fabricRef.current = null
        setCanvasReady(false)
      }
    }

    // Use requestAnimationFrame to ensure container is rendered
    let cleanup: (() => void) | undefined
    const rafId = requestAnimationFrame(() => {
      cleanup = initCanvas()
    })
    
    return () => {
      cancelAnimationFrame(rafId)
      cleanup?.()
    }
  }, [])

  // Render canvas content
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !canvasReady) return

    // Remove all objects but keep canvas setup
    const objects = canvas.getObjects()
    objects.forEach(obj => canvas.remove(obj))

    // Check for status messages
    const statusMessage = 
      status === "loading" ? 'Loading...' :
      !session ? 'Not Authenticated' :
      !data ? 'No Activity Selected' :
      isPending ? 'Loading Activity...' : null

    if (statusMessage) {
      const text = createText(
        statusMessage,
        canvas.width / 2,
        canvas.height / 2,
        {
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#ffffff',
          originX: 'center',
          originY: 'center',
        }
      )
      canvas.add(text)
      canvas.renderAll()
      return
    }

    // Render metrics
    if (visibleMetrics.length === 0) {
      canvas.renderAll()
      return
    }

    const columnWidth = canvas.width / columns
    const rowsCount = Math.ceil(visibleMetrics.length / columns)
    const rowHeight = canvas.height / rowsCount

    const originX: TOriginX = alignment === 'left' ? 'left' : alignment === 'right' ? 'right' : 'center'

    visibleMetrics.forEach((key, i) => {
      const metric = getMetricByKey(key)
      if (!metric) return

      const col = i % columns
      const row = Math.floor(i / columns)
      
      // Calculate x position
      let x = col * columnWidth + columnWidth / 2
      if (alignment === 'left') x = col * columnWidth + 20
      else if (alignment === 'right') x = (col + 1) * columnWidth - 20

      const centerY = row * rowHeight + rowHeight / 2
      const labelFontSize = getSizeValue(labelSize, 'label')
      const valueFontSize = getSizeValue(valueSize, 'value')
      
      // Calculate positions with reduced gap
      const labelY = centerY - TEXT_GAP / 2 - valueFontSize / 2
      const valueY = centerY + TEXT_GAP / 2 + labelFontSize / 2

      const label = createText(metric.label, x, labelY, {
        fontSize: labelFontSize,
        fontFamily,
        fill: textColor,
        originX,
        originY: 'bottom',
      })

      const value = createText(metric.formatter(data, unitSystem), x, valueY, {
        fontSize: valueFontSize,
        fontFamily,
        fill: textColor,
        fontWeight: 'bold',
        originX,
        originY: 'top',
      })

      canvas.add(label, value)
    })

    canvas.renderAll()
  }, [canvasReady, status, session, isPending, data, visibleMetrics, unitSystem, alignment, labelSize, valueSize, columns, fontFamily, textColor])

  const baseClassName = `w-full h-full min-h-[200px] sm:min-h-[400px] rounded-lg border bg-card text-card-foreground shadow-sm ${className}`

  return (
    <div ref={containerRef} className={baseClassName}>
      <canvas ref={canvasRef} />
    </div>
  )
})

OverlayCanvasComponent.displayName = 'OverlayCanvas'

export const OverlayCanvas = OverlayCanvasComponent

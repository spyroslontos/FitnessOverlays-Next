"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { OverlayCanvas, OverlayCanvasRef } from "./overlay-canvas"
import { MetricControls } from "./metric-controls"
import { UnitSystem } from "@/lib/metrics"
import { useAthletePreferences } from "@/hooks/use-athlete-preferences"

interface ActivityContainerProps {
  data?: any
  isPending?: boolean
}

export function OverlayWorkspace({ data, isPending }: ActivityContainerProps) {
  const canvasRef = useRef<OverlayCanvasRef>(null)

  const DEFAULTS = {
    visibleMetrics: ["distance", "time", "pace", "avgSpeed"],
    alignment: 'center' as const,
    labelSize: 'medium' as const,
    valueSize: 'medium' as const,
    columns: 1,
    fontFamily: 'Poppins',
    textColor: '#ffffff'
  }

  const [visibleMetrics, setVisibleMetrics] = useState<string[]>(DEFAULTS.visibleMetrics)
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>(DEFAULTS.alignment)
  const [labelSize, setLabelSize] = useState<'small' | 'medium' | 'large'>(DEFAULTS.labelSize)
  const [valueSize, setValueSize] = useState<'small' | 'medium' | 'large'>(DEFAULTS.valueSize)
  const [columns, setColumns] = useState<1 | 2 | 3 | 4>(DEFAULTS.columns as 1 | 2 | 3 | 4)
  const [fontFamily, setFontFamily] = useState<string>(DEFAULTS.fontFamily)
  const [textColor, setTextColor] = useState<string>(DEFAULTS.textColor)
  const { data: athletePreferences } = useAthletePreferences()
  
  const unitSystem: UnitSystem = athletePreferences?.unitSystem || "metric"

  const handleExport = () => {
    const dataURL = canvasRef.current?.exportToPNG()
    if (!dataURL) return

    // Download the image
    const link = document.createElement('a')
    link.download = `overlay-${Date.now()}.png`
    link.href = dataURL
    link.click()
  }

  const STORAGE_KEYS = {
    selectedMetrics: "selectedMetrics",
    alignment: "alignment", 
    labelSize: "labelSize",
    valueSize: "valueSize",
    columns: "columns",
    fontFamily: "fontFamily",
    textColor: "textColor"
  }

  useEffect(() => {
    const loadSetting = (key: string, setter: (value: any) => void, parser?: (value: string) => any) => {
      const saved = localStorage.getItem(key)
      if (saved) {
        try {
          const value = parser ? parser(saved) : JSON.parse(saved)
          // Validate the value before setting
          if (value !== null && value !== undefined) {
            setter(value)
          }
        } catch (error) {
          console.warn(`Failed to parse saved ${key}:`, error)
        }
      }
    }

    // Only load from localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      // Load metrics (array) - needs JSON parsing
      loadSetting(STORAGE_KEYS.selectedMetrics, setVisibleMetrics)
      
      // Load simple string values
      const alignment = localStorage.getItem(STORAGE_KEYS.alignment)
      if (alignment && ['left', 'center', 'right'].includes(alignment)) {
        setAlignment(alignment as 'left' | 'center' | 'right')
      }
      
      const labelSize = localStorage.getItem(STORAGE_KEYS.labelSize)
      if (labelSize && ['small', 'medium', 'large'].includes(labelSize)) {
        setLabelSize(labelSize as 'small' | 'medium' | 'large')
      }
      
      const valueSize = localStorage.getItem(STORAGE_KEYS.valueSize)
      if (valueSize && ['small', 'medium', 'large'].includes(valueSize)) {
        setValueSize(valueSize as 'small' | 'medium' | 'large')
      }
      
      const columns = localStorage.getItem(STORAGE_KEYS.columns)
      if (columns) {
        const num = Number(columns)
        if ([1, 2, 3, 4].includes(num)) {
          setColumns(num as 1 | 2 | 3 | 4)
        }
      }
      
      const fontFamily = localStorage.getItem(STORAGE_KEYS.fontFamily)
      if (fontFamily) {
        setFontFamily(fontFamily)
      }
      
      const textColor = localStorage.getItem(STORAGE_KEYS.textColor)
      if (textColor) {
        setTextColor(textColor)
      }
    }
  }, [])

  const createHandler = (setter: (value: any) => void, key: string, serializer?: (value: any) => string) => 
    (value: any) => {
      setter(value)
      localStorage.setItem(key, serializer ? serializer(value) : JSON.stringify(value))
    }

  const handleMetricsChange = createHandler(setVisibleMetrics, STORAGE_KEYS.selectedMetrics)
  const handleAlignmentChange = createHandler(setAlignment, STORAGE_KEYS.alignment, String)
  const handleLabelSizeChange = createHandler(setLabelSize, STORAGE_KEYS.labelSize, String)
  const handleValueSizeChange = createHandler(setValueSize, STORAGE_KEYS.valueSize, String)
  const handleColumnsChange = createHandler(setColumns as (value: 1 | 2 | 3 | 4) => void, STORAGE_KEYS.columns, String)
  const handleFontFamilyChange = createHandler(setFontFamily, STORAGE_KEYS.fontFamily, String)
  const handleTextColorChange = createHandler(setTextColor, STORAGE_KEYS.textColor, String)

  const resetAllSettings = () => {
    setVisibleMetrics(DEFAULTS.visibleMetrics)
    setAlignment(DEFAULTS.alignment)
    setLabelSize(DEFAULTS.labelSize)
    setValueSize(DEFAULTS.valueSize)
    setColumns(DEFAULTS.columns as 1 | 2 | 3 | 4)
    setFontFamily(DEFAULTS.fontFamily)
    setTextColor(DEFAULTS.textColor)

    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  }

  return (
    <div className="flex flex-col h-full min-h-[300px] sm:min-h-[500px]">
      <OverlayCanvas
        ref={canvasRef}
        visibleMetrics={visibleMetrics}
        data={data}
        unitSystem={unitSystem}
        isPending={isPending}
        className="flex-1"
        alignment={alignment}
        labelSize={labelSize}
        valueSize={valueSize}
        columns={columns}
        fontFamily={fontFamily}
        textColor={textColor}
      />
      <div className="pt-2 w-full">
        <MetricControls
          onMetricsChange={handleMetricsChange}
          selectedMetrics={visibleMetrics}
          activityData={data}
          alignment={alignment}
          onAlignmentChange={handleAlignmentChange}
          labelSize={labelSize}
          onLabelSizeChange={handleLabelSizeChange}
          valueSize={valueSize}
          onValueSizeChange={handleValueSizeChange}
          columns={columns}
          onColumnsChange={handleColumnsChange}
          fontFamily={fontFamily}
          onFontFamilyChange={handleFontFamilyChange}
          textColor={textColor}
          onTextColorChange={handleTextColorChange}
          onResetAll={resetAllSettings}
          onExport={handleExport}
        />
      </div>
    </div>
  )
}

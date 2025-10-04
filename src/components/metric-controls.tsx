"use client"

import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RotateCcw, AlignLeft, AlignCenter, AlignRight, Download } from "lucide-react"
import { METRICS, UnitSystem, DEFAULT_METRICS } from "@/lib/metrics"
import { useAthletePreferences } from "@/hooks/use-athlete-preferences"

type Alignment = 'left' | 'center' | 'right'
type Size = 'small' | 'medium' | 'large'

interface MetricControlsProps {
  onMetricsChange: (metrics: string[]) => void
  selectedMetrics: string[]
  activityData?: any
  alignment?: Alignment
  onAlignmentChange?: (alignment: Alignment) => void
  labelSize?: Size
  onLabelSizeChange?: (size: Size) => void
  valueSize?: Size
  onValueSizeChange?: (size: Size) => void
  columns?: 1 | 2 | 3 | 4
  onColumnsChange?: (columns: 1 | 2 | 3 | 4) => void
  fontFamily?: string
  onFontFamilyChange?: (font: string) => void
  textColor?: string
  onTextColorChange?: (color: string) => void
  onResetAll?: () => void
  onExport?: () => void
}

export function MetricControls({
  onMetricsChange,
  selectedMetrics,
  activityData,
  alignment = 'center',
  onAlignmentChange,
  labelSize = 'medium',
  onLabelSizeChange,
  valueSize = 'medium',
  onValueSizeChange,
  columns = 1,
  onColumnsChange,
  fontFamily = 'Poppins',
  onFontFamilyChange,
  textColor = '#ffffff',
  onTextColorChange,
  onResetAll,
  onExport,
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

  const CONFIG = {
    align: { order: ['left', 'center', 'right'] as const, icon: (align: string) => 
      align === 'left' ? <AlignLeft className="h-4 w-4" /> : 
      align === 'center' ? <AlignCenter className="h-4 w-4" /> : 
      <AlignRight className="h-4 w-4" />
    },
    size: { order: ['small', 'medium', 'large'] as const, display: { small: 'S', medium: 'M', large: 'L' } },
    columns: { order: [1, 2, 3, 4] as const },
    font: { 
      order: ['Poppins', 'Lato', 'Oswald', 'Lora', 'Special Elite'] as const,
      labels: { 'Poppins': 'Modern', 'Lato': 'Clean', 'Oswald': 'Bold', 'Lora': 'Elegant', 'Special Elite': 'Retro' }
    }
  }

  const CycleButton = ({ 
    value, 
    order, 
    onChange, 
    display, 
    icon,
    className = ""
  }: {
    value: any
    order: readonly any[]
    onChange: (value: any) => void
    display?: (value: any) => React.ReactNode
    icon?: (value: any) => React.ReactNode
    className?: string
  }) => (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => {
        const currentIndex = order.indexOf(value)
        const nextIndex = (currentIndex + 1) % order.length
        onChange(order[nextIndex])
      }} 
      className={`px-3 ${className}`}
    >
      {icon ? icon(value) : display ? display(value) : value}
    </Button>
  )

  return (
    <div className="flex gap-2 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="default" className="text-base">
            Metrics
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start" side="top">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-base">Select Metrics</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefaults}
                className="text-sm h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
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
                  className="text-base whitespace-nowrap px-4 py-3 h-auto w-auto min-w-fit data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=on]:border-green-600"
                >
                  {metric.label}
                </Toggle>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {onAlignmentChange && (
        <CycleButton
          value={alignment}
          order={CONFIG.align.order}
          onChange={onAlignmentChange}
          icon={CONFIG.align.icon}
        />
      )}

      {onLabelSizeChange && (
        <CycleButton
          value={labelSize}
          order={CONFIG.size.order}
          onChange={onLabelSizeChange}
          display={(size) => CONFIG.size.display[size as keyof typeof CONFIG.size.display]}
        />
      )}

      {onValueSizeChange && (
        <CycleButton
          value={valueSize}
          order={CONFIG.size.order}
          onChange={onValueSizeChange}
          display={(size) => CONFIG.size.display[size as keyof typeof CONFIG.size.display]}
        />
      )}

      {onColumnsChange && (
        <CycleButton
          value={columns}
          order={CONFIG.columns.order}
          onChange={onColumnsChange}
        />
      )}

      {onFontFamilyChange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="px-3">
              {CONFIG.font.labels[fontFamily as keyof typeof CONFIG.font.labels] || 'Font'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start" side="top">
            <div className="space-y-3">
              <h4 className="font-medium">Select Font</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {CONFIG.font.order.map((font) => (
                  <Button
                    key={font}
                    variant={fontFamily === font ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFontFamilyChange(font)}
                    className="text-sm whitespace-nowrap px-4 py-3 h-auto w-auto min-w-fit data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=on]:border-green-600"
                  >
                    {CONFIG.font.labels[font]}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {onTextColorChange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="p-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ 
                  background: 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080)'
                }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start" side="top">
            <div className="space-y-4">
              <h4 className="font-medium text-base">Text Color</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Custom Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => onTextColorChange(e.target.value)}
                    className="w-full h-10 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Quick Colors</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { color: '#ffffff', name: 'White' },
                      { color: '#000000', name: 'Black' },
                      { color: '#ff0000', name: 'Red' },
                      { color: '#00ff00', name: 'Green' },
                      { color: '#0000ff', name: 'Blue' },
                      { color: '#ffff00', name: 'Yellow' },
                      { color: '#ff00ff', name: 'Magenta' },
                      { color: '#00ffff', name: 'Cyan' },
                      { color: '#ffa500', name: 'Orange' },
                      { color: '#800080', name: 'Purple' },
                      { color: '#ffc0cb', name: 'Pink' },
                      { color: '#a52a2a', name: 'Brown' }
                    ].map(({ color, name }) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{ backgroundColor: color }}
                        onClick={() => onTextColorChange(color)}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport} className="px-3 text-green-600 hover:text-green-700 hover:bg-green-50 ml-auto">
          <Download className="h-4 w-4 mr-1" />
          Export PNG
        </Button>
      )}

      {onResetAll && (
        <Button variant="outline" size="sm" onClick={onResetAll} className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50">
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset All
        </Button>
      )}
    </div>
  )
}

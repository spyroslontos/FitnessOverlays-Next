"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { HeatmapCalendar } from "./heatmap-calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Semantic colors for levels 0-3 (Empty + 3 intensities)
const LEVEL_CLASSES = [
  "bg-muted", // Level 0 (Empty)
  "bg-primary", // Level 1: "1 activity" or Low
  "bg-secondary", // Level 2: "2 activities" or Med
  "bg-destructive", // Level 3: "3+ activities" or High
]

import { useSearchParams, usePathname } from "next/navigation"

// ... imports

export function ActivityHeatmap({
  years,
  currentYear: _currentYear,
  measurementPreference,
}: {
  years: number[]
  currentYear: number
  measurementPreference?: string
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isImperial = measurementPreference === "feet"

  type Metric = "count" | "time" | "distance" | "elevation"

  // Read initial values from URL once (deep-linking), then keep state client-side
  // to avoid App Router navigations that can re-run server components (e.g. header auth()).
  const [yearStr, setYearStr] = React.useState(
    () => searchParams.get("year") || "last365",
  )
  const [metric, setMetric] = React.useState<Metric>(
    () => (searchParams.get("metric") as Metric) || "count",
  )

  const writeUrl = React.useCallback(
    (nextYear: string, nextMetric: Metric) => {
      const params = new URLSearchParams(searchParams.toString())

      if (nextYear === "last365") params.delete("year")
      else params.set("year", nextYear)

      if (nextMetric === "count") params.delete("metric")
      else params.set("metric", nextMetric)

      const qs = params.toString()
      const next = `${pathname}${qs ? `?${qs}` : ""}`
      window.history.replaceState(null, "", next)
    },
    [pathname, searchParams],
  )

  const onYearChange = (nextYear: string) => {
    setYearStr(nextYear)
    writeUrl(nextYear, metric)
  }

  const onMetricChange = (nextMetric: Metric) => {
    setMetric(nextMetric)
    writeUrl(yearStr, nextMetric)
  }

  // Calculate range
  const { startEpoch, endEpoch, endDate, rangeDays } = React.useMemo(() => {
    if (yearStr === "last365") {
      const end = new Date()
      // Normalize to end of day to ensure stable URL params for caching
      end.setHours(23, 59, 59, 999)
      const start = new Date()
      start.setDate(end.getDate() - 365)
      start.setHours(0, 0, 0, 0)

      return {
        startEpoch: Math.floor(start.getTime() / 1000),
        endEpoch: Math.floor(end.getTime() / 1000),
        endDate: end,
        rangeDays: 365,
      }
    }

    // Check if selecting "Current Year" -> also normalize to end of day
    const year = parseInt(yearStr)
    const isCurrentYear = year === new Date().getFullYear()

    const end = isCurrentYear ? new Date() : new Date(year, 11, 31)
    if (isCurrentYear) end.setHours(23, 59, 59, 999)

    const start = new Date(year, 0, 1)
    return {
      startEpoch: Math.floor(start.getTime() / 1000),
      endEpoch: Math.floor(end.getTime() / 1000),
      endDate: end,
      rangeDays: Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1,
    }
  }, [yearStr])

  // Fetch Data
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", yearStr],
    queryFn: async () => {
      let all: any[] = [],
        page = 1
      while (true) {
        const res = await fetch(
          `/api/activities?after=${startEpoch}&before=${endEpoch}&page=${page}&per_page=200`,
        )
        if (!res.ok) break
        const batch = await res.json()
        if (!batch.length) break
        all.push(...batch)
        if (batch.length < 200) break
        page++
      }
      return all
    },
  })

  // Transform Data
  const data = React.useMemo(() => {
    const map = new Map<string, number>()
    activities.forEach((act) => {
      // Strava: `start_date` is UTC; `start_date_local` matches the athlete/activity local time.
      const key = (act.start_date_local ?? act.start_date).split("T")[0]
      let val = 0
      if (metric === "count") val = 1
      if (metric === "time") val = act.moving_time / 60
      if (metric === "distance") {
        val = isImperial ? act.distance / 1609.34 : act.distance / 1000
      }
      if (metric === "elevation") {
        val = isImperial
          ? act.total_elevation_gain * 3.28084
          : act.total_elevation_gain
      }
      map.set(key, (map.get(key) || 0) + val)
    })

    return Array.from(map).map(([date, realVal]) => {
      let proxyValue = 0

      if (metric === "count") {
        if (realVal === 1) proxyValue = 1
        else if (realVal === 2) proxyValue = 3
        else if (realVal >= 3) proxyValue = 6
      } else if (metric === "time") {
        if (realVal < 30) proxyValue = 1
        else if (realVal < 60) proxyValue = 3
        else proxyValue = 6
      } else if (metric === "distance") {
        const l1 = isImperial ? 3 : 5
        const l2 = isImperial ? 12 : 20
        if (realVal < l1) proxyValue = 1
        else if (realVal < l2) proxyValue = 3
        else proxyValue = 6
      } else if (metric === "elevation") {
        const l1 = isImperial ? 500 : 150
        const l2 = isImperial ? 2000 : 600
        if (realVal < l1) proxyValue = 1
        else if (realVal < l2) proxyValue = 3
        else proxyValue = 6
      }

      return {
        date,
        value: proxyValue,
        meta: { realValue: realVal },
      }
    })
  }, [activities, metric, isImperial])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Activity Heatmap</h1>
        <div className="flex gap-2">
          <Select value={yearStr} onValueChange={onYearChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last365">Last 365 Days</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={metric} onValueChange={onMetricChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="count">Activities</SelectItem>
              <SelectItem value="time">Time (m)</SelectItem>
              <SelectItem value="distance">
                {isImperial ? "Dist (mi)" : "Dist (km)"}
              </SelectItem>
              <SelectItem value="elevation">
                {isImperial ? "Elev (ft)" : "Elev (m)"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <HeatmapCalendar
          title={yearStr === "last365" ? "Last 365 Days" : `Year ${yearStr}`}
          data={data}
          endDate={endDate}
          rangeDays={rangeDays}
          legend={{ placement: "bottom" }}
          axisLabels={true}
          levelClassNames={LEVEL_CLASSES}
          renderTooltip={(cell) => {
            if (cell.disabled) return null
            const realVal = (cell.meta as any)?.realValue ?? 0
            let displayVal = realVal
            if (metric !== "count") {
              displayVal = Math.round(realVal * 10) / 10
            }

            const unit =
              metric === "count"
                ? realVal === 1
                  ? "activity"
                  : "activities"
                : metric === "time"
                  ? "mins"
                  : metric === "distance"
                    ? isImperial
                      ? "mi"
                      : "km"
                    : isImperial
                      ? "ft"
                      : "m"

            return (
              <div className="text-sm">
                <div className="font-medium">
                  {displayVal} {unit}
                </div>
                <div className="text-muted-foreground text-xs">
                  {cell.label}
                </div>
              </div>
            )
          }}
        />
      )}
    </div>
  )
}

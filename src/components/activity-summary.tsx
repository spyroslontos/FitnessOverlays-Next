"use client"

import { Calendar, Clock, Route, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatDistance, formatTime, formatPace, formatDate } from "@/lib/activity-utils"
import { useAthletePreferences } from "@/hooks/use-athlete-preferences"

interface ActivityDetailsProps {
  data?: any
  isPending?: boolean
}

export function ActivitySummary({ data, isPending }: ActivityDetailsProps) {
  const { data: athletePreferences } = useAthletePreferences()
  
  const unitSystem = athletePreferences?.unitSystem || "metric"
  const dateFormat = athletePreferences?.datePreference || "%m/%d/%Y"
  
  if (isPending) {
    return (
      <Card className="p-3 mb-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="p-4 mb-4">
        <div className="text-center text-gray-500 text-lg">
          Select an activity to view details
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 mb-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium text-lg truncate flex-1" title={data.name}>
            {data.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-600 flex-shrink-0">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-base whitespace-nowrap">
              {formatDate(data.start_date, dateFormat)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-base">
          <div className="flex items-center gap-1">
            <Route className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{formatDistance(data.distance, unitSystem)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{formatTime(data.moving_time)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {formatPace(data.distance, data.moving_time, unitSystem)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

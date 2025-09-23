"use client"

import { Calendar, Clock, Route, Zap, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    <Card className="p-3 mb-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center gap-2">
          <h3 className="font-medium text-base truncate flex-1" title={data.name}>
            {data.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-600 flex-shrink-0">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span className="text-sm whitespace-nowrap">
              {formatDate(data.start_date, dateFormat)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Route className="h-3 w-3 text-gray-500" />
            <span className="font-medium">{formatDistance(data.distance, unitSystem)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="font-medium">{formatTime(data.moving_time)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-gray-500" />
            <span className="font-medium">
              {formatPace(data.distance, data.moving_time, unitSystem)}
            </span>
          </div>
          <div className="flex justify-end ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => window.open(`https://www.strava.com/activities/${data.id}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

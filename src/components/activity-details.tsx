"use client"

import { Calendar, Clock, Route, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatDistance, formatTime, formatPace } from "@/lib/activity-utils"

interface ActivityDetailsProps {
  data?: any
  isPending?: boolean
}

export function ActivityDetails({ data, isPending }: ActivityDetailsProps) {
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
      <Card className="p-3 mb-4">
        <div className="text-center text-gray-500 text-sm">
          Select an activity to view details
        </div>
      </Card>
    )
  }

  const formatDateRelative = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="p-3 mb-4">
      <div className="space-y-2">
        <h3 className="font-medium text-sm truncate" title={data.name}>
          {data.name}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">
              {formatDateRelative(data.start_date)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Route className="h-3 w-3 text-gray-500" />
            <span className="font-medium">{formatDistance(data.distance)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="font-medium">{formatTime(data.moving_time)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-gray-500" />
            <span className="font-medium">
              {formatPace(data.distance, data.moving_time)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

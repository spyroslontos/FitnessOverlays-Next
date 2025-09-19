"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Activity {
  id: number
  name: string
  type: string
  distance: number
  moving_time: number
  total_elevation_gain: number
  start_date: string
  average_speed?: number
  max_speed?: number
  average_heartrate?: number
  max_heartrate?: number
  kudos_count: number
  comment_count: number
}

interface ActivityTileProps {
  activity: Activity
  onClick?: (activityId: number) => void
}

export function ActivityTile({ activity, onClick }: ActivityTileProps) {
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${meters.toFixed(0)} m`
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className="w-full cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onClick?.(activity.id)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {activity.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-primary/10 rounded-full">
                {activity.type}
              </span>
              <span>{formatDate(activity.start_date)}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Distance</div>
                <div className="font-medium">
                  {formatDistance(activity.distance)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Time</div>
                <div className="font-medium">
                  {formatTime(activity.moving_time)}
                </div>
              </div>
              {activity.total_elevation_gain > 0 && (
                <div>
                  <div className="text-muted-foreground">Elevation</div>
                  <div className="font-medium">
                    {activity.total_elevation_gain.toFixed(0)}m
                  </div>
                </div>
              )}
              {activity.average_speed && (
                <div>
                  <div className="text-muted-foreground">Avg Speed</div>
                  <div className="font-medium">
                    {activity.average_speed.toFixed(1)} m/s
                  </div>
                </div>
              )}
            </div>
            {(activity.kudos_count > 0 || activity.comment_count > 0) && (
              <div className="flex gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                {activity.kudos_count > 0 && (
                  <span>❤️ {activity.kudos_count}</span>
                )}
                {activity.comment_count > 0 && (
                  <span>💬 {activity.comment_count}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="right">
        <div className="text-sm">
          <div className="font-medium">{activity.name}</div>
          <div className="text-xs text-muted-foreground">
            {activity.type} • {formatDate(activity.start_date)}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

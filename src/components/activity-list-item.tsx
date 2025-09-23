"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatDistance, formatTime, formatDate, formatSpeed, formatElevation } from "@/lib/activity-utils"
import { useAthletePreferences } from "@/hooks/use-athlete-preferences"

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
  isLatest?: boolean
  isSelected?: boolean
}

export function ActivityListItem({ activity, onClick, isLatest, isSelected }: ActivityTileProps) {
  const { data: athletePreferences } = useAthletePreferences()
  
  const unitSystem = athletePreferences?.unitSystem || "metric"
  const dateFormat = athletePreferences?.datePreference || "%m/%d/%Y"
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className="w-full cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onClick?.(activity.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-sm font-medium line-clamp-2 flex-1 pr-2">
                {activity.name}
              </CardTitle>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(activity.start_date, dateFormat)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-primary/10 rounded-full">
                {activity.type}
              </span>
              {isLatest && (
                <Badge className="text-xs bg-orange-500 hover:bg-orange-600 text-white">
                  Latest
                </Badge>
              )}
              {isSelected && (
                <Badge variant="default" className="text-xs">
                  Selected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Distance</div>
                <div className="font-medium">
                  {formatDistance(activity.distance, unitSystem)}
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
                    {formatElevation(activity.total_elevation_gain, unitSystem)}
                  </div>
                </div>
              )}
              {activity.average_speed && (
                <div>
                  <div className="text-muted-foreground">Avg Speed</div>
                  <div className="font-medium">
                    {formatSpeed(activity.average_speed, unitSystem)}
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
              {activity.type} • {formatDate(activity.start_date, dateFormat)}
            </div>
          </div>
      </TooltipContent>
    </Tooltip>
  )
}

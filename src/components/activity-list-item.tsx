"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Route, Clock, Zap, TrendingUp, Heart, Crown } from "lucide-react"
import { formatDistance, formatTime, formatDate, formatPace, formatElevation } from "@/lib/activity-utils"
import { useAthletePreferences } from "@/hooks/use-athlete-preferences"
import { Skeleton } from "@/components/ui/skeleton"

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
  pr_count?: number
}

interface ActivityTileProps {
  activity?: Activity
  onClick?: (activityId: number) => void
  isLatest?: boolean
  isSelected?: boolean
}

interface MetricProps {
  icon: React.ReactNode
  label: string
  value: string | number
  className?: string
}

function Metric({ icon, label, value, className = "" }: MetricProps) {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <div className="min-w-0">
        <div className="text-muted-foreground text-xs">{label}</div>
        <div className={`font-medium ${className}`}>
          {value}
        </div>
      </div>
    </div>
  )
}

export function ActivityListItem({ activity, onClick, isLatest, isSelected }: ActivityTileProps) {
  const { data: athletePreferences, isLoading: isLoadingPreferences } = useAthletePreferences()
  
  const isLoading = isLoadingPreferences || !activity
  const unitSystem = athletePreferences?.unitSystem || "metric"
  const dateFormat = athletePreferences?.datePreference || "%m/%d/%Y"

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-4 w-[60px]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-[80px]" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-[40px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-[40px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-[40px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className="w-full cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onClick?.(activity.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-base font-medium line-clamp-2 flex-1 pr-2">
                {activity.name}
              </CardTitle>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(activity.start_date, dateFormat)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {activity.type}
              </Badge>
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
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Metric
                icon={<Route className="h-3 w-3 text-gray-500 flex-shrink-0" />}
                label="Distance"
                value={formatDistance(activity.distance, unitSystem)}
              />
              <Metric
                icon={<Clock className="h-3 w-3 text-gray-500 flex-shrink-0" />}
                label="Time"
                value={formatTime(activity.moving_time)}
              />
              <Metric
                icon={<Zap className="h-3 w-3 text-gray-500 flex-shrink-0" />}
                label="Pace"
                value={formatPace(activity.distance, activity.moving_time, unitSystem)}
              />
              {activity.total_elevation_gain > 0 && (
                <Metric
                  icon={<TrendingUp className="h-3 w-3 text-gray-500 flex-shrink-0" />}
                  label="Elevation"
                  value={formatElevation(activity.total_elevation_gain, unitSystem)}
                />
              )}
              {activity.kudos_count > 0 && (
                <Metric
                  icon={<Heart className="h-3 w-3 text-gray-500 flex-shrink-0" />}
                  label="Kudos"
                  value={activity.kudos_count}
                />
              )}
              {(activity.pr_count ?? 0) > 0 && (
                <Metric
                  icon={<Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
                  label="PRs"
                  value={activity.pr_count!}
                  className="text-yellow-600"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="right">
          <div className="text-base">
            <div className="font-medium">{activity.name}</div>
            <div className="text-sm text-muted-foreground">
              {activity.type} • {formatDate(activity.start_date, dateFormat)}
            </div>
          </div>
      </TooltipContent>
    </Tooltip>
  )
}

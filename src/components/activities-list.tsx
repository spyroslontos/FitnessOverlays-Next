"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { ActivityTile } from "./activity-tile"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination"

export function ActivitiesList() {
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null
  )
  const [currentPage, setCurrentPage] = useState(1)

  const { isPending, error, data } = useQuery({
    queryKey: ["activityData"],
    queryFn: () => fetch("/api/activities").then((res) => res.json()),
  })

  const allActivities = Array.isArray(data) ? data : []
  const perPage = 5
  const totalPages = Math.ceil(allActivities.length / perPage)
  const startIndex = (currentPage - 1) * perPage
  const endIndex = startIndex + perPage
  const activities = allActivities.slice(startIndex, endIndex)
  const latestActivity = allActivities.length > 0 ? allActivities[0] : null

  // Set initial selection on data load
  useEffect(() => {
    if (latestActivity) {
      const persisted = localStorage.getItem("selectedActivityId")
      const timestamp = localStorage.getItem("selectedActivityTimestamp")
      const oneDay = 24 * 60 * 60 * 1000

      const shouldUseLatest =
        !persisted || !timestamp || Date.now() - Number(timestamp) >= oneDay
      const activityId = shouldUseLatest ? latestActivity.id : Number(persisted)

      setSelectedActivityId(activityId)
      localStorage.setItem("selectedActivityId", activityId.toString())
      localStorage.setItem("selectedActivityTimestamp", Date.now().toString())
      window.dispatchEvent(
        new CustomEvent("activitySelected", { detail: activityId })
      )
    }
  }, [latestActivity])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isPending ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : error ? (
            <div className="text-sm text-destructive">
              Error loading activities
            </div>
          ) : (
            activities.map((activity: any, index: number) => (
              <div key={activity.id} className="relative">
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  {index === 0 && currentPage === 1 && (
                    <Badge variant="secondary">Latest</Badge>
                  )}
                  {selectedActivityId === activity.id && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>
                <ActivityTile
                  activity={activity}
                  onClick={(id) => {
                    setSelectedActivityId(id)
                    localStorage.setItem("selectedActivityId", id.toString())
                    localStorage.setItem(
                      "selectedActivityTimestamp",
                      Date.now().toString()
                    )
                    window.dispatchEvent(
                      new CustomEvent("activitySelected", { detail: id })
                    )
                  }}
                />
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <Pagination className="mt-3">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => handlePageChange(currentPage - 1)}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  )
}

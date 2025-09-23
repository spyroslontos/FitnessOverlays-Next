"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { ActivityListItem } from "./activity-list-item"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null,
  )
  const [currentPage, setCurrentPage] = useState(1)
  const { data: session } = useSession()

  const { isPending, error, data } = useQuery({
    queryKey: ["activityData"],
    queryFn: () => fetch("/api/activities").then((res) => res.json()),
    enabled: !!session,
  })

  const allActivities = Array.isArray(data) ? data : []
  const perPage = 5
  const totalPages = Math.ceil(allActivities.length / perPage)
  const startIndex = (currentPage - 1) * perPage
  const endIndex = startIndex + perPage
  const activities = allActivities.slice(startIndex, endIndex)
  const latestActivity = allActivities.length > 0 ? allActivities[0] : null

  // Set initial selection on data load (only after hydration)
  useEffect(() => {
    if (latestActivity && typeof window !== 'undefined') {
      const persisted = localStorage.getItem("selectedActivityId")
      const timestamp = localStorage.getItem("selectedActivityTimestamp")
      const oneDay = 24 * 60 * 60 * 1000

      const shouldUseLatest =
        !persisted || !timestamp || Date.now() - Number(timestamp) >= oneDay
      const activityId = shouldUseLatest ? latestActivity.id : Number(persisted)

      selectActivity(activityId)
    }
  }, [latestActivity])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const selectActivity = (activityId: number) => {
    setSelectedActivityId(activityId)
    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedActivityId", activityId.toString())
      localStorage.setItem("selectedActivityTimestamp", Date.now().toString())
      window.dispatchEvent(
        new CustomEvent("activitySelected", { detail: activityId }),
      )
    }
  }

  const jumpToLatest = () => {
    if (latestActivity) {
      setCurrentPage(1)
      selectActivity(latestActivity.id)
    }
  }

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      style={{ "--sidebar-width": "30rem" } as React.CSSProperties}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1 px-2 py-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/images/FitnessOverlaysLogo.jpg"
                    alt="FitnessOverlays"
                    width={30}
                    height={30}
                    className="rounded"
                  />
                </div>
                <div className="grid flex-1 text-left text-base leading-tight">
                  <span className="truncate font-medium">Activities</span>
                </div>
              </div>
              {latestActivity && (currentPage !== 1 || selectedActivityId !== latestActivity.id) && (
                <Button 
                  size="sm" 
                  onClick={jumpToLatest}
                  className="text-sm px-3 py-2 h-auto ml-2"
                >
                  Jump to latest
                </Button>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <div className="space-y-2">
          {!session ? (
            <div className="text-base text-muted-foreground text-center py-8">
              Please sign in to view your activities
            </div>
          ) : isPending ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : error ? (
            <div className="text-base text-destructive">
              Error loading activities
            </div>
          ) : (
            activities.map((activity: any, index: number) => (
              <ActivityListItem
                key={activity.id}
                activity={activity}
                isLatest={index === 0 && currentPage === 1}
                isSelected={selectedActivityId === activity.id}
                onClick={selectActivity}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <Pagination className="mt-4 mb-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const page =
                  Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="text-sm"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </SidebarContent>
    </Sidebar>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { ActivityDetails } from "./activity-details"
import { ActivityContainer } from "./activity-container"

export function ActivityViewer() {
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null)
  const { data: session } = useSession()

  const { data, isPending } = useQuery({
    queryKey: ["activityData", selectedActivityId],
    queryFn: () =>
      fetch(`/api/activities/${selectedActivityId}`).then((res) => res.json()),
    enabled: !!selectedActivityId && !!session,
  })

  useEffect(() => {
    const updateSelection = () => {
      const persisted = localStorage.getItem("selectedActivityId")
      if (persisted) setSelectedActivityId(Number(persisted))
    }
    updateSelection()
    window.addEventListener("storage", updateSelection)
    const handleActivitySelect = (event: CustomEvent) =>
      setSelectedActivityId(event.detail)
    window.addEventListener(
      "activitySelected",
      handleActivitySelect as EventListener,
    )
    return () => {
      window.removeEventListener("storage", updateSelection)
      window.removeEventListener(
        "activitySelected",
        handleActivitySelect as EventListener,
      )
    }
  }, [])

  return (
    <div className="space-y-4">
      <ActivityDetails data={data} isPending={isPending} />
      <ActivityContainer data={data} isPending={isPending} />
    </div>
  )
}

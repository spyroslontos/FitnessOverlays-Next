"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export function AthleteInfo() {
  const { data: session } = useSession()

  const { error } = useQuery({
    queryKey: ["athleteData"],
    queryFn: () => fetch("/api/athlete").then((res) => res.json()),
    enabled: !!session,
  })

  if (error) return `An error has occurred: ${error.message}`

  return null
}

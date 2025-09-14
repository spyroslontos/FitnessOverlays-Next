"use client"

import { useSession } from "next-auth/react"

export function SessionInfo() {
  const { data: session, status } = useSession()

  if (status === "loading") return <div>Loading...</div>
  if (!session) return <div>Not logged in</div>

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Session Data</h3>
      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  )
}

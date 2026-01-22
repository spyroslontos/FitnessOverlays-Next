import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { HomeHeader } from "@/components/home-header"

export const metadata = {
  title: "FitnessOverlays | Activity Heatmap",
  description: "Visualize your Strava activities over time.",
}

export default async function HeatmapPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/")
  }

  // Fetch user to get creation date and preferences
  const user = await db.query.users.findFirst({
    where: eq(users.id, parseInt(session.user.id)),
  })

  // Calculate year range
  const currentYear = new Date().getFullYear()
  let startYear = currentYear
  
  if (user?.stravaCreatedAt) {
    startYear = user.stravaCreatedAt.getFullYear()
  } else if (user?.createdAt) {
      startYear = user.createdAt.getFullYear()
  }

  // Generate years list [current, ..., start]
  const years: number[] = []
  for (let y = currentYear; y >= startYear; y--) {
    years.push(y)
  }

  return (
    <div className="min-h-screen flex flex-col">
       <HomeHeader />
       <main className="flex-1 container mx-auto py-10 px-4">
          <ActivityHeatmap years={years} currentYear={currentYear} />
       </main>
    </div>
  )
}

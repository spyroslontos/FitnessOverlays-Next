import { SessionInfo } from "@/components/session-info"
import { AthleteInfo } from "@/components/athlete-info"
import { ActivitiesList } from "@/components/activities-list"
import { ActivityContainer } from "@/components/activity-container"

export default async function App() {
  await SessionInfo()

  return (
    <>
      <AthleteInfo />
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
        <ActivitiesList />
        <ActivityContainer />
      </div>
    </>
  )
}

import { SessionInfo } from "@/components/session-info";
import { AthleteInfo } from "@/components/athlete-info";
import { ActivityData } from "@/components/activity-data";
import { ActivitiesList } from "@/components/activities-list";

export default async function App() {
  // Just call for console logging
  await SessionInfo();

  return (
    <>
      <AthleteInfo />
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
        <ActivitiesList />
        <div>
          <ActivityData />
        </div>
      </div>
    </>
  );
}

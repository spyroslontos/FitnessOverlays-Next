import { SessionInfo } from "@/components/session-info";
import { AthleteInfo } from "@/components/athlete-info";
import { ActivityData } from "@/components/activity-data";

export default function Home() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Fitness Overlays</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Session Info</h2>
          <SessionInfo />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4">Athlete Data</h2>
          <AthleteInfo />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4">Activity Data</h2>
          <ActivityData />
        </div>
      </div>
    </>
  );
}

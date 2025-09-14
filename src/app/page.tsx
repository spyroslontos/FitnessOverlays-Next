import { AuthButton } from "@/components/auth-button";
import { SessionInfo } from "@/components/session-info";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Strava Auth Test</h1>
      <div className="space-y-4">
        <AuthButton />
        <SessionInfo />
      </div>
    </div>
  );
}

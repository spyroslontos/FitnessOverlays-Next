"use client";

import { authClient } from "@/lib/auth-client";
import { syncStravaData } from "@/lib/actions";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [isSyncing, setIsSyncing] = useState(false);

  // No background sync needed - happens during login now

  const handleLogin = async () => {
    await authClient.signIn.oauth2({
      providerId: "strava",
      callbackURL: "/",
      errorCallbackURL: "/",
      disableRedirect: false,
    });
  };

  const handleSync = async () => {
    if (!session?.user?.id) return;
    setIsSyncing(true);
    try {
      const result = await syncStravaData(session.user.id);
      if (result.synced) {
        console.log("✅ Data synced successfully!");
      } else if (result.reason === "cooldown") {
        console.log(
          `⏳ Please wait ${result.remainingTime}s before syncing again`
        );
      } else {
        console.log(`❌ Sync failed: ${result.reason}`);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            Fitness Overlays
          </h2>

          {session?.user ? (
            <div className="text-center space-y-4">
              <p className="text-lg mb-4 text-gray-600">
                Welcome,{" "}
                <span className="font-semibold">{session.user.name}</span>!
              </p>

              <Button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full"
              >
                {isSyncing ? "Syncing..." : "Sync Strava Data"}
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg mb-6 text-gray-600">
                Connect with Strava to get started
              </p>
              <Button onClick={handleLogin} className="w-full">
                Login with Strava
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

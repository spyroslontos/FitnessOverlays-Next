"use client";

import { authClient } from "@/lib/auth-client";
import { syncStravaData } from "@/lib/actions";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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

  const handleLogout = async () => {
    await authClient.signOut();
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
      {/* Simple Header */}
      <header className="border-b bg-white p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">FitnessOverlays</h1>

          {session?.user && (
            <div className="flex items-center gap-3">
              <Button onClick={handleLogout} variant="ghost" size="sm">
                Logout
              </Button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {session.user.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

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

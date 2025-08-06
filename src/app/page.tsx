"use client";

import { authClient } from "@/lib/auth-client";
import { syncStravaData } from "@/lib/actions";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [isSyncing, setIsSyncing] = useState(false);

  // Background sync when user is logged in
  useEffect(() => {
    if (session?.user?.id) {
      // Fire and forget - don't block the UI
      syncStravaData(session.user.id).catch(console.error);
    }
  }, [session?.user?.id]);

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
      console.log(result.synced ? "Fresh data fetched!" : "Using cached data");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Fitness Overlays
        </h1>
        
        {session?.user ? (
          <div className="text-center space-y-4">
            <p className="text-lg mb-4 text-gray-600">
              Welcome, <span className="font-semibold">{session.user.name}</span>!
            </p>
            
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isSyncing ? "Syncing..." : "Sync Strava Data"}
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg mb-6 text-gray-600">
              Connect with Strava to get started
            </p>
            <button
              onClick={handleLogin}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Login with Strava
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "strava",
    });
  };

  const handleLogout = async () => {
    await authClient.signOut();
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
          <div className="text-center">
            <p className="text-lg mb-4 text-gray-600">
              Welcome, <span className="font-semibold">{session.user.name}</span>!
            </p>
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

"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <header className="border-b bg-white p-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">FitnessOverlays</h1>

        {session?.user && (
          <div className="flex items-center gap-3">
            <Button onClick={handleLogout} variant="ghost" size="sm">
              Logout
            </Button>

            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={session.user.image || undefined}
                  alt={session.user.name || "Profile"}
                />
                <AvatarFallback>
                  {session.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">
                {session.user.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

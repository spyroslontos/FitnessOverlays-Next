"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  mobileSidebarTrigger?: ReactNode;
}

export function Header({ mobileSidebarTrigger }: HeaderProps) {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const lastSyncRef = useRef<number>(0);

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  // Background sync on login, navigation, and refresh (server enforces cooldown)
  useEffect(() => {
    if (!session?.user?.id) return;
    const now = Date.now();
    // Client-side soft cooldown to avoid spamming on fast route changes
    if (now - lastSyncRef.current < 30_000) return;
    lastSyncRef.current = now;
    fetch("/api/sync", { method: "POST" }).catch(() => {});
  }, [session?.user?.id, pathname]);

  return (
    <header className="border-b bg-white p-3 sm:p-4 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          {mobileSidebarTrigger}
          <a href="/" className="text-xl sm:text-2xl font-bold truncate">
            FitnessOverlays
          </a>
        </div>

        {session?.user && (
          <div className="flex items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
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
                  <span className="text-sm font-medium hidden sm:block max-w-[160px] truncate">
                    {session.user.name}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <a href="/app">App</a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}

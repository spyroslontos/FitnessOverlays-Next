"use client"

import { SidebarIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import Link from "next/link"

export function AppHeader() {
  const { toggleSidebar } = useSidebar()
  const { data: session } = useSession()

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="relative flex h-(--header-height) w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            className="h-10 px-4 gap-2 sm:gap-2"
            variant="ghost"
            onClick={toggleSidebar}
          >
            <SidebarIcon className="h-5 w-5" />
            <span className="text-base font-medium hidden sm:inline">
              Activities
            </span>
          </Button>
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-none"
          >
            <span className="text-fitness-green">Fitness</span><span className="text-fitness-dark-gray">Overlays</span>
          </Link>
        </div>
        <div className="flex items-center">
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarImage
                    src={session.user?.image || ""}
                    alt={session.user?.name || ""}
                  />
                  <AvatarFallback>
                    {session.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-base">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session.user?.image || ""}
                        alt={session.user?.name || ""}
                      />
                      <AvatarFallback>
                        {session.user?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate font-medium">
                      {session.user?.name || "User"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-base"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

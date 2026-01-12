import { auth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SignInButton, SignOutButton } from "@/components/auth-buttons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export async function HomeHeader() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-2 min-h-14 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity leading-none">
          <span className="text-fitness-green">Fitness</span><span className="text-fitness-dark-gray dark:text-fitness-light-gray">Overlays</span>
        </Link>

        <div className="flex items-center gap-2 ml-auto">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
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
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8">
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
                <DropdownMenuItem asChild>
                  <SignOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SignInButton size="sm"/>
          )}
        </div>
      </div>
    </header>
  )
}

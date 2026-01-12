import { signIn, signOut } from "@/lib/auth"
import { LogOut } from "lucide-react"
import Image from "next/image"

export function SignInButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-10 w-auto",
    md: "h-14 w-auto sm:h-14",
    lg: "h-18 w-auto sm:h-18",
  }
  
  return (
    <form
      action={async () => {
        "use server"
        await signIn("strava")
      }}
      className="flex items-center"
    >
      <button
        type="submit"
        className="inline-flex items-center justify-center focus:outline-none"
      >
        <Image
          src="/images/btn_strava_connect_with_orange_x2.svg"
          alt="Connect with Strava"
          width={192}
          height={48}
          className={sizeClasses[size]}
          style={{ width: "auto" }}
        />
      </button>
    </form>
  )
}

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut({ redirectTo: "/" })
      }}
    >
      <button type="submit" className="w-full text-left flex items-center">
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </button>
    </form>
  )
}

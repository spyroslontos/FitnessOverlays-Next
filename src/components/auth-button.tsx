"use client"

import { signIn, signOut } from "next-auth/react"
import { useSession } from "next-auth/react"

export function AuthButton() {
  const { data: session } = useSession()
  console.log(session)

  if (session) {
    return (
      <div>
        <p>Logged in as: {session.user?.name}</p>
        <button onClick={() => signOut()} className="px-4 py-2 bg-red-500 text-white rounded">
          Logout
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => signIn("strava")} className="inline-flex items-center justify-center focus:outline-none ">
    <img
      src="/images/btn_strava_connect_with_orange_x2.svg"
      alt="Connect with Strava"
      className={"h-10 w-auto sm:h-12"}
    />
    </button>
  )
}

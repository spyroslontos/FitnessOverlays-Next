"use client"

import { signIn, signOut } from "next-auth/react"

export function SignInButton() {
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

export function SignOutButton() {
  return (
    <button onClick={() => signOut()} className="bg-gray-500 text-white px-4 py-2 rounded">
      Sign Out
    </button>
  )
}

export default function AuthButtons() {
  return (
    <div className="flex gap-4">
      <SignInButton />
      <SignOutButton />
    </div>
  )
}

import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HomeHeader } from "@/components/home-header"

export default async function Home() {
  const session = await auth()

  return (
    <>
      <HomeHeader />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <h1 className="text-4xl font-bold">Fitness Overlays</h1>
        <div className="flex gap-4">
          {session && (
            <Link href="/app">
              <Button size="lg">Go to App</Button>
            </Link>
          )}
        </div>
      </div>
    </>
  )
}

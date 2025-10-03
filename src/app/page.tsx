import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HomeHeader } from "@/components/home-header"
import { Footer } from "@/components/footer"
import { SignInButton } from "@/components/auth-buttons"
import { FAQSection } from "@/components/faq-section"

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      
      <main className="px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold">
              Convert Your Strava Activities into Transparent Fitness Overlays for Instagram
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Easily generate customizable Strava activity overlays to share on Instagram Stories, Reels, or TikTok. Perfect for runners, cyclists, and fitness creators.
            </p>

            <div className="pt-4 space-y-4">
              {session ? (
                <Button size="lg" asChild>
                  <Link href="/app">Open App</Link>
                </Button>
              ) : (
                <>
                  <SignInButton large />
                  <p className="text-sm text-muted-foreground">
                    Completely free. Just log in with Strava.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="p-8">
              <div className="text-3xl mb-4">✨</div>
              <div className="font-medium">Customize your overlays</div>
            </Card>
            <Card className="p-8">
              <div className="text-3xl mb-4">📥</div>
              <div className="font-medium">Export as PNG</div>
            </Card>
            <Card className="p-8">
              <div className="text-3xl mb-4">🚀</div>
              <div className="font-medium">Share on social media</div>
            </Card>
          </div>

          <FAQSection />

        </div>
      </main>

      <Footer />
    </div>
  )
}

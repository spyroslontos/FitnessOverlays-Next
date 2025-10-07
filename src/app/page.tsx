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

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-8 transition-all hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative text-center">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="font-semibold text-lg mb-2">Customize your overlays</h3>
                <p className="text-sm text-muted-foreground">Personalize colors, fonts, and metrics</p>
              </div>
            </Card>
            
            <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-8 transition-all hover:shadow-xl hover:shadow-blue-500/20 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative text-center">
                <div className="text-5xl mb-4">📥</div>
                <h3 className="font-semibold text-lg mb-2">Export as PNG</h3>
                <p className="text-sm text-muted-foreground">Download transparent overlays instantly</p>
              </div>
            </Card>
            
            <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-8 transition-all hover:shadow-xl hover:shadow-orange-500/20 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative text-center">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="font-semibold text-lg mb-2">Share on social media</h3>
                <p className="text-sm text-muted-foreground">Perfect for Instagram, TikTok & more</p>
              </div>
            </Card>
          </div>

          <FAQSection />

        </div>
      </main>

      <Footer />
    </div>
  )
}

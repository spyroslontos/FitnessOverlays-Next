import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HomeHeader } from "@/components/home-header"
import { Footer } from "@/components/footer"
import { SignInButton } from "@/components/auth-buttons"
import { FAQSection } from "@/components/faq-section"
import { SocialProof } from "@/components/social-proof"
import { unstable_cache } from "next/cache"
import { db } from "@/db"
import { users } from "@/db/schema"
import { count } from "drizzle-orm"

const getCachedUserCount = unstable_cache(
  async () => {
    const result = await db.select({ count: count() }).from(users)
    return result[0]?.count ?? 0
  },
  ["user-count"],
  { revalidate: 3600 } // 1 hour
)

export default async function Home() {
  const session = await auth()
  const userCount = await getCachedUserCount()

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      
      <main className="flex-1">
        <section className="w-full py-16 md:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 space-y-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-xl mx-auto">
              Create Custom Strava Stickers & Overlays for Instagram Stories
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Generate transparent Strava-style stats stickers for your runs, rides, and workouts. Export clean visuals for Instagram Stories, Reels, and TikTok.
            </p>

            <div className="space-y-6">
              {session ? (
                <Button 
                  size="lg" 
                  asChild 
                  className="rounded-full px-12 py-6 text-lg font-semibold bg-fitness-green hover:bg-fitness-dark-green text-white"
                >
                  <Link href="/app">Open App</Link>
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <SignInButton size="lg" />
                  <p className="text-sm text-muted-foreground">
                    Completely free. Just log in with Strava.
                  </p>
                </div>
              )}
              
              <SocialProof count={userCount} />
            </div>
          </div>
        </section>


        <section className="w-full py-12 md:py-16 bg-muted/40 border-y border-border/50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group relative overflow-hidden bg-background/50 backdrop-blur-sm border-border/50 p-8 transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-linear-to-br from-purple-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-center space-y-4">
                  <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">✨</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Customize your overlays</h3>
                    <p className="text-sm text-muted-foreground">Personalize colors, fonts, and metrics to match your vibe</p>
                  </div>
                </div>
              </Card>
              
              <Card className="group relative overflow-hidden bg-background/50 backdrop-blur-sm border-border/50 p-8 transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-linear-to-br from-blue-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-center space-y-4">
                  <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">📥</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Export as PNG</h3>
                    <p className="text-sm text-muted-foreground">Download crystal clear transparent overlays instantly</p>
                  </div>
                </div>
              </Card>
              
              <Card className="group relative overflow-hidden bg-background/50 backdrop-blur-sm border-border/50 p-8 transition-all hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-linear-to-br from-orange-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-center space-y-4">
                  <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">🚀</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Share on social media</h3>
                    <p className="text-sm text-muted-foreground">Perfect format for Instagram Stories, TikTok & more</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4">
            <FAQSection />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

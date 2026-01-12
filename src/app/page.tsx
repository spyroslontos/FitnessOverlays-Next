import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HomeHeader } from "@/components/home-header"
import { Footer } from "@/components/footer"
import { SignInButton } from "@/components/auth-buttons"
import { FAQSection } from "@/components/faq-section"
import { SocialProof } from "@/components/social-proof"
import { LinkIcon, List, Palette, Download } from "lucide-react"
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
        <section className="w-full py-8 md:py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 space-y-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-xl mx-auto">
              Create Custom Strava Stickers & Overlays for Instagram Stories
            </h1>
            
            <p className="text-md md:text-lg text-muted-foreground max-w-lg mx-auto">
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
                <div className="flex flex-col items-center gap-1">
                  <SignInButton size="lg" />
                  <p className="text-sm text-muted-foreground dark:text-fitness-light-gray">
                    Completely free. Just log in with Strava.
                  </p>
                </div>
              )}
              
              <SocialProof count={userCount} />
            </div>
          </div>
        </section>


        <section className="w-full py-12 md:py-24 bg-background border-y border-border/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Turn any Strava activity into a custom overlay for Instagram Stories in a few simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="group relative overflow-hidden bg-card border-border/50 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-fitness-green/10 hover:-translate-y-2 rounded-3xl">
                <div className="absolute inset-0 bg-linear-to-br from-fitness-green/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative space-y-6">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-linear-to-br from-fitness-green to-fitness-dark-green text-white shadow-xl shadow-fitness-green/20 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <LinkIcon className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-foreground">1. Connect Strava</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Securely sync your account to access activities instantly. Fast, read-only access with no manual entry needed.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="group relative overflow-hidden bg-card border-border/50 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-fitness-green/10 hover:-translate-y-2 rounded-3xl">
                <div className="absolute inset-0 bg-linear-to-br from-fitness-green/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative space-y-6">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-linear-to-br from-fitness-green to-fitness-dark-green text-white shadow-xl shadow-fitness-green/20 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                      <List className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-foreground">2. Choose Activity</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Select any run, ride, or workout. We automatically pull your stats to generate your unique custom overlay.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="group relative overflow-hidden bg-card border-border/50 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-fitness-green/10 hover:-translate-y-2 rounded-3xl">
                <div className="absolute inset-0 bg-linear-to-br from-fitness-green/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative space-y-6">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-linear-to-br from-fitness-green to-fitness-dark-green text-white shadow-xl shadow-fitness-green/20 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Palette className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-foreground">3. Customize Design</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Style your transparent overlay with custom colors and stats. Create a look that matches your aesthetic perfectly.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="group relative overflow-hidden bg-card border-border/50 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-fitness-green/10 hover:-translate-y-2 rounded-3xl">
                <div className="absolute inset-0 bg-linear-to-br from-fitness-green/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative space-y-6">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-linear-to-br from-fitness-green to-fitness-dark-green text-white shadow-xl shadow-fitness-green/20 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                      <Download className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-foreground">4. Download Sticker</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Export a high-quality transparent PNG. Add it as a sticker to Instagram Stories, Reels, or TikTok.
                    </p>
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

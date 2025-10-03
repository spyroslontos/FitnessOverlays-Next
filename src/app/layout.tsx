import type { Metadata } from "next"
import { Geist, Geist_Mono, Poppins, Lato, Oswald, Lora, Special_Elite } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/components/query-provider"
import { SessionProvider } from "next-auth/react"
import { TooltipProvider } from "@/components/ui/tooltip"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
})

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const specialElite = Special_Elite({
  variable: "--font-special-elite",
  subsets: ["latin"],
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "Fitness Overlays - Create Beautiful Strava Activity Graphics",
  description: "Transform your Strava activities into stunning visual overlays. Create professional fitness content with customizable templates, rich data visualization, and easy sharing options.",
  keywords: ["fitness overlays", "strava graphics", "activity visualization", "fitness content", "running graphics", "cycling overlays", "workout visualization"],
  authors: [{ name: "Spyros Lontos" }],
  creator: "Spyros Lontos",
  publisher: "Spyros Lontos",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fitnessoverlays.com",
    title: "Fitness Overlays - Create Beautiful Strava Activity Graphics",
    description: "Transform your Strava activities into stunning visual overlays. Create professional fitness content with customizable templates and rich data visualization.",
    siteName: "Fitness Overlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fitness Overlays - Create Beautiful Strava Activity Graphics",
    description: "Transform your Strava activities into stunning visual overlays. Create professional fitness content with customizable templates and rich data visualization.",
    creator: "@spyroslontos",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${lato.variable} ${oswald.variable} ${lora.variable} ${specialElite.variable} antialiased`}
      >
        <SessionProvider>
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

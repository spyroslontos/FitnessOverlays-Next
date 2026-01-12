import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Poppins, Lato, Oswald, Lora, Special_Elite } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/components/query-provider"
import { SessionProvider } from "next-auth/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
})

const poppins = Poppins({
  weight: ["400", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
})

const lato = Lato({
  weight: ["400", "700"],
  variable: "--font-lato",
  subsets: ["latin"],
})

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
})

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
})

const specialElite = Special_Elite({
  weight: "400",
  variable: "--font-special-elite",
  subsets: ["latin"],
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
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${poppins.variable} ${lato.variable} ${oswald.variable} ${lora.variable} ${specialElite.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

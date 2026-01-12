import NextAuth from "next-auth"
import Strava from "next-auth/providers/strava"
import { db } from "@/db"
import { users } from "@/db/schema"
import { upsertUser } from "@/lib/user-sync"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Strava({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read,activity:read_all,profile:read_all",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }

      if (profile) {
        token.athleteId = profile.id
      }

      // Check if token needs refresh (Strava tokens expire every 6 hours)
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        return token
      }

      // Refresh the token
      if (token.refreshToken) {
        try {
          console.log("🔄 Refreshing Strava token")
          const response = await fetch("https://www.strava.com/oauth/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: process.env.STRAVA_CLIENT_ID!,
              client_secret: process.env.STRAVA_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
          })

          if (!response.ok) {
            console.error("Failed to refresh token:", response.status)
            return token
          }

          const refreshedTokens = await response.json()

          token.accessToken = refreshedTokens.access_token
          token.refreshToken = refreshedTokens.refresh_token
          token.expiresAt = Date.now() / 1000 + refreshedTokens.expires_in

          console.log("✅ Token refreshed successfully")
        } catch (error) {
          console.error("Error refreshing token:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user.id = token.athleteId as string
      return session
    },
  },
  events: {
    async signIn({ profile }) {
      if (profile) {
        try {
          console.log("🔄 Syncing user data after sign in")
          // Ensure profile.id is a number (Strava API returns numbers, but Profile type might call it string)
          const profileWithId = {
            ...profile,
            id: typeof profile.id === 'string' ? parseInt(profile.id, 10) : profile.id
          }
          await upsertUser(profileWithId)
        } catch (error) {
          console.error("Error syncing user data after sign in:", error)
        }
      }
    },
  },
})

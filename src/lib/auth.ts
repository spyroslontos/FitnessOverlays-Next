import NextAuth from "next-auth"
import Strava from "next-auth/providers/strava"
import { db } from "@/db"
import { users } from "@/db/schema"

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

      if (profile) {
        token.athleteId = profile.id

        // Store profile data in DB during authentication
        try {
          const userData = {
            id: parseInt(profile.id as string, 10),
            name: `${profile.firstname} ${profile.lastname}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            athleteId: parseInt(profile.id as string, 10),
            username: profile.username as string,
            firstname: profile.firstname as string,
            lastname: profile.lastname as string,
            bio: profile.bio as string,
            city: profile.city as string,
            state: profile.state as string,
            country: profile.country as string,
            sex: profile.sex as string,
            premium: profile.premium as boolean,
            summit: profile.summit as boolean,
            badgeTypeId: profile.badge_type_id as number,
            weight: profile.weight ? profile.weight.toString() : null,
            profileMedium: profile.profile_medium as string,
            profile: profile.profile as string,
            followerCount: profile.follower_count as number,
            friendCount: profile.friend_count as number,
            mutualFriendCount: profile.mutual_friend_count as number,
            athleteType: profile.athlete_type as number,
            datePreference: profile.date_preference as string,
            measurementPreference: profile.measurement_preference as string,
            postableClubsCount: profile.postable_clubs_count as number,
            ftp: profile.ftp ? profile.ftp.toString() : null,
            stravaCreatedAt: profile.created_at
              ? new Date(profile.created_at as string)
              : null,
            stravaUpdatedAt: profile.updated_at
              ? new Date(profile.updated_at as string)
              : null,
            fullAthleteData: profile,
            lastStravaSync: new Date(),
          }

          const { createdAt, ...updateData } = userData

          await db.insert(users).values(userData).onConflictDoUpdate({
            target: users.id,
            set: updateData,
          })
          console.log("💾 Profile data stored during authentication")
        } catch (error) {
          console.error("Error storing profile data:", error)
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
})

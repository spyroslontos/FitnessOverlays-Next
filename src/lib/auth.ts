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
      if (profile) {
        token.athleteId = profile.id

        // Store profile data in DB during authentication
        try {
          await db
            .insert(users)
            .values({
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
            })
            .onConflictDoUpdate({
              target: users.id,
              set: {
                name: `${profile.firstname} ${profile.lastname}`,
                updatedAt: new Date(),
                lastStravaSync: new Date(),
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
              },
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

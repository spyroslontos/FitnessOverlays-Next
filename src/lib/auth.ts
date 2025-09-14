import NextAuth from "next-auth"
import Strava from "next-auth/providers/strava"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Strava({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: { params: { scope: "read,activity:read_all,profile:read_all" } },
    }),
  ],
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (account?.provider === "strava" && profile && user?.id) {
        try {
          const now = new Date()
          const updateData: any = {
            stravaProfile: profile,
            lastAuthenticatedAt: now,
            lastStravaSync: now,
          }

          // Set first authentication timestamp for new users
          if (isNewUser) {
            updateData.firstAuthenticatedAt = now
          }

          // Extract and store individual Strava fields
          if (profile.id) updateData.athleteId = profile.id
          if (profile.username) updateData.athleteUsername = profile.username
          if (profile.firstname) updateData.athleteFirstName = profile.firstname
          if (profile.lastname) updateData.athleteLastName = profile.lastname
          if (profile.profile) updateData.athleteProfile = profile.profile
          if (profile.profile_medium) updateData.profileMedium = profile.profile_medium
          if (profile.sex) updateData.sex = profile.sex
          if (profile.city) updateData.city = profile.city
          if (profile.state) updateData.state = profile.state
          if (profile.country) updateData.country = profile.country
          if (profile.follower_count !== undefined) updateData.followerCount = profile.follower_count
          if (profile.friend_count !== undefined) updateData.friendCount = profile.friend_count
          if (profile.mutual_friend_count !== undefined) updateData.mutualFriendCount = profile.mutual_friend_count
          if (profile.date_preference) updateData.datePreference = profile.date_preference
          if (profile.measurement_preference) updateData.measurementPreference = profile.measurement_preference
          if (profile.weight !== undefined) updateData.weight = profile.weight
          if (profile.premium !== undefined) updateData.premium = profile.premium
          if (profile.summit !== undefined) updateData.summit = profile.summit
          if (profile.athlete_type !== undefined) updateData.athleteType = profile.athlete_type
          if (profile.badge_type_id !== undefined) updateData.badgeTypeId = profile.badge_type_id
          if (profile.blocked !== undefined) updateData.blocked = profile.blocked
          if (profile.can_follow !== undefined) updateData.canFollow = profile.can_follow
          if (profile.created_at && typeof profile.created_at === 'string') {
            updateData.stravaCreatedAt = new Date(profile.created_at)
          }
          if (profile.updated_at && typeof profile.updated_at === 'string') {
            updateData.stravaUpdatedAt = new Date(profile.updated_at)
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updateData
          })
        } catch (error) {
          console.error("Failed to store Strava profile:", error)
        }
      }
    }
  },
  callbacks: {
    async session({ session, user }) {
      return {
        ...session,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          athleteId: user.athleteId,
        }
      }
    }
  },
})

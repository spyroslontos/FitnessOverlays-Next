import { db } from "@/db"
import { users } from "@/db/schema"

export async function upsertUser(data: any) {
  try {
    const userData = {
      id: data.id,
      name: `${data.firstname} ${data.lastname}`,
      createdAt: new Date(),
      athleteId: data.id,
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      bio: data.bio,
      city: data.city,
      state: data.state,
      country: data.country,
      sex: data.sex,
      premium: data.premium,
      summit: data.summit,
      badgeTypeId: data.badge_type_id,
      weight: data.weight ? data.weight.toString() : null,
      profileMedium: data.profile_medium,
      profile: data.profile,
      followerCount: data.follower_count,
      friendCount: data.friend_count,
      mutualFriendCount: data.mutual_friend_count,
      athleteType: data.athlete_type,
      datePreference: data.date_preference,
      measurementPreference: data.measurement_preference,
      postableClubsCount: data.postable_clubs_count,
      ftp: data.ftp ? data.ftp.toString() : null,
      stravaCreatedAt: data.created_at ? new Date(data.created_at) : null,
      stravaUpdatedAt: data.updated_at ? new Date(data.updated_at) : null,
      fullAthleteData: data,
      lastStravaSync: new Date(),
    }

    const { createdAt: _, ...updateData } = userData

    await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: updateData,
    })

    console.log("✅ User data synced successfully")
    return userData
  } catch (error) {
    console.error("Error syncing user data:", error)
    throw error
  }
}

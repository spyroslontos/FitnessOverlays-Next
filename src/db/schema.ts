import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  bigint,
  json,
  serial,
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey(), // This IS the athleteId
  name: text("name").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),

  // Strava athlete data - important fields for metrics/graphs
  athleteId: bigint("athlete_id", { mode: "number" }).notNull(),
  username: text("username"),
  firstname: text("firstname"),
  lastname: text("lastname"),
  bio: text("bio"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  sex: text("sex"),
  premium: boolean("premium"),
  summit: boolean("summit"),
  badgeTypeId: integer("badge_type_id"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  profileMedium: text("profile_medium"),
  profile: text("profile"),
  followerCount: integer("follower_count"),
  friendCount: integer("friend_count"),
  mutualFriendCount: integer("mutual_friend_count"),
  athleteType: integer("athlete_type"),
  datePreference: text("date_preference"),
  measurementPreference: text("measurement_preference"),
  postableClubsCount: integer("postable_clubs_count"),
  ftp: decimal("ftp", { precision: 5, scale: 2 }),

  // Strava timestamps
  stravaCreatedAt: timestamp("strava_created_at", { withTimezone: true }),
  stravaUpdatedAt: timestamp("strava_updated_at", { withTimezone: true }),

  // Full JSON data for flexibility
  fullAthleteData: json("full_athlete_data").notNull(),

  // Sync tracking
  lastStravaSync: timestamp("last_strava_sync", { withTimezone: true }),
})

// Activity Lists (for pagination/sync management) - Store the 30 activities from list
export const activityLists = pgTable("activity_lists", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  data: json("data").notNull(), // Activity list JSON (30 activities)
  lastSynced: timestamp("last_synced", { withTimezone: true })
    .notNull()
    .defaultNow(),
  page: integer("page").notNull().default(1),
  perPage: integer("per_page").notNull().default(30),
})

// Individual Activities - Store detailed data when user selects specific activities
export const activities = pgTable("activities", {
  activityId: bigint("activity_id", { mode: "number" }).primaryKey(),
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  data: json("data").notNull(), // Full Strava activity JSON from detailed API call
  lastSynced: timestamp("last_synced", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Overlays (your app's custom data)
export const overlays = pgTable("overlays", {
  id: text("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  config: json("config").notNull(), // JSON config for overlay
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

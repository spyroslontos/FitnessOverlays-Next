import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  bigint,
  json,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),

  // Strava-specific fields
  athleteId: bigint("athlete_id", { mode: "number" }),
  athleteUsername: text("athlete_username"),
  athleteFirstName: text("athlete_first_name"),
  athleteLastName: text("athlete_last_name"),
  athleteProfile: text("athlete_profile"),
  profileMedium: text("profile_medium"),

  sex: text("sex"),
  city: text("city"),
  state: text("state"),
  country: text("country"),

  followerCount: integer("follower_count"),
  friendCount: integer("friend_count"),

  datePreference: text("date_preference"),
  measurementPreference: text("measurement_preference"),

  weight: decimal("weight", { precision: 5, scale: 2 }),
  premium: boolean("premium"),
  athleteType: integer("athlete_type"),

  // Sync tracking
  lastStravaSync: timestamp("last_strava_sync", { withTimezone: true }),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

// Strava Activities
export const activities = pgTable("activities", {
  activityId: bigint("activity_id", { mode: "number" }).primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  data: json("data").notNull(), // Full Strava activity JSON
  lastSynced: timestamp("last_synced", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Activity Lists (for pagination/sync management)
export const activityLists = pgTable("activity_lists", {
  id: integer("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  data: json("data").notNull(), // Activity list JSON
  lastSynced: timestamp("last_synced", { withTimezone: true })
    .notNull()
    .defaultNow(),
  page: integer("page").notNull().default(1),
  perPage: integer("per_page").notNull().default(30),
});

// Overlays (your app's custom data)
export const overlays = pgTable("overlays", {
  id: text("id").primaryKey(),
  userId: text("user_id")
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
});

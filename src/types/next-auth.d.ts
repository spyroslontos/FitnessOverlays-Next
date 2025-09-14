import NextAuth from "next-auth"
import { AdapterUser } from "next-auth/adapters"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    stravaProfile?: any
  }

  interface User {
    stravaProfile?: any
    athleteId?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    athleteId?: any
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    stravaProfile?: any
  }
}

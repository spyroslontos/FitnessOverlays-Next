import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, users, sessions, accounts, verifications } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "strava",
          clientId: process.env.STRAVA_CLIENT_ID!,
          clientSecret: process.env.STRAVA_CLIENT_SECRET!,
          authorizationUrl: "https://www.strava.com/oauth/authorize",
          tokenUrl: "https://www.strava.com/oauth/token",
          redirectURI: "http://localhost:3000/api/auth/callback/strava",
          // Strava expects scopes as comma-delimited string in the OAuth authorize URL
          scopes: ["read,activity:read_all,profile:read_all"],
          pkce: true,
          userInfoUrl: "https://www.strava.com/api/v3/athlete",
          overrideUserInfo: true,
          getUserInfo: async (tokens) => {
            const profile = await fetch(
              "https://www.strava.com/api/v3/athlete",
              {
                headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                },
              }
            ).then((res) => res.json());

            return {
              id: profile.id.toString(),
              name: `${profile.firstname} ${profile.lastname}`,
              email: `strava_${profile.id}@oauth`,
              emailVerified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              image: profile.profile || null,
            };
          },
        },
      ],
    }),
  ],
});

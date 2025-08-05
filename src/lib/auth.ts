import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

export const auth = betterAuth({
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
          scopes: ["read,activity:read_all,profile:read_all"],
          userInfoUrl: "https://www.strava.com/api/v3/athlete",
          overrideUserInfo: true,
          mapProfileToUser: (profile) => {
            return {
              name: profile.firstname + " " + profile.lastname,
              email: profile.email || `strava-${profile.id}@example.com`,
            };
          },
        },
      ],
    }),
  ],
}); 
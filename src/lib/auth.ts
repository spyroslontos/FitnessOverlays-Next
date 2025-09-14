import NextAuth from "next-auth";
import Strava from "next-auth/providers/strava";

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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});

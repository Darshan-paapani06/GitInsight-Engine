import GitHubProvider from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          // `repo` enables private repositories. `read:org` helps with org/team-style leaderboards.
          scope: "repo read:org",
        },
      },
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          login: profile.login,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // account is available on initial sign-in
      const accessToken = (account as any)?.access_token as string | undefined;
      if (accessToken) {
        (token as any).accessToken = accessToken;
      }

      const loginFromProfile = (profile as any)?.login as string | undefined;
      const loginFromUser = (user as any)?.login as string | undefined;
      const resolvedLogin = loginFromProfile ?? loginFromUser;
      if (resolvedLogin) (token as any).login = resolvedLogin;

      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).accessToken as string | undefined;
      if (session.user) {
        (session.user as any).login = (token as any).login as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};


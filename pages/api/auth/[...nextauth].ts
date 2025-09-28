import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { AuthAPI } from "../../../lib/django-api/auth";
import { GoogleProfile, RefreshRequest } from "../../../types/auth";



export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {

          console.log("Google sign-in for:", user.email);
          console.log("Google profile:", profile);

        // ✅ Prepare Google profile for Django
        const googleProfile: GoogleProfile = {
          email: user.email!,
          name: user.name!,
          sub: account.providerAccountId,
          picture: user.image ?? undefined,
        };

        // ✅ Call Django API
        const djangoResponse = await AuthAPI.googleAuth(googleProfile);
          
          console.log("Django authentication successful:", djangoResponse);

          // ✅ Attach tokens to NextAuth `user` object
          user.accessToken = djangoResponse.access_token;
          user.refreshToken = djangoResponse.refresh_token;
          user.tokenExpires = Date.now() + djangoResponse.expires_in * 1000;
          
          return true;
        } catch (error) {
          console.error("Django authentication failed:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          tokenExpires: user.tokenExpires,
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.tokenExpires && Date.now() < token.tokenExpires) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful login
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith("/")) return baseUrl + url;
      return baseUrl + "/dashboard";
    },
  },
  pages: {
    signIn: "/", // Custom sign-in page (landing page)
  },
  session: {
    strategy: "jwt",
  },
};

async function refreshAccessToken(token: any) {
  try {
    console.log("Refreshing token with Django backend");
    
    const refresh_request: RefreshRequest = { refresh: token.refreshToken };
    // Use the Django API service to refresh token
    const response = await AuthAPI.refreshToken(refresh_request);

    console.log("Token refreshed successfully:", response);

    return {
      ...token,
      accessToken: response.access,
      refreshToken: response.refresh ?? token.refreshToken, // Fall back to old refresh token
      tokenExpires: Date.now() + 30 * 60 * 1000, // Assume new token expires in 30 minutes
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth(authOptions);
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { AuthAPI } from "../../../lib/django-api";

// OAuth API integration for Google Authentication
async function authenticateWithDjango(googleProfile: any) {
  try {
    console.log("Authenticating with OAuth backend:", googleProfile.email);
    
    // Use the real OAuth API service to authenticate
    const response = await AuthAPI.googleAuth({
      email: googleProfile.email,
      name: googleProfile.name,
      sub: googleProfile.sub,
      picture: googleProfile.picture,
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        access_token: data.access,
        refresh_token: data.refresh,
        user_data: data.user,
        created: data.created,
        expires_in: 3600, // Default to 1 hour
      };
    } else {
      throw new Error(data.error || "OAuth authentication failed");
    }
  } catch (error) {
    console.error("OAuth authentication error:", error);
    throw error;
  }
}

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
          // Send Google profile to OAuth backend
          const djangoResponse = await authenticateWithDjango({
            email: user.email,
            name: user.name,
            sub: account.providerAccountId,
            picture: profile?.image,
          });
          
          // Store OAuth tokens in user object
          user.accessToken = djangoResponse.access_token;
          user.refreshToken = djangoResponse.refresh_token;
          user.userData = djangoResponse.user_data;
          user.created = djangoResponse.created;
          user.tokenExpires = Date.now() + (djangoResponse.expires_in * 1000);
          
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
          userData: user.userData,
          created: user.created,
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
      session.userData = token.userData;
      session.created = token.created;
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
    console.log("Refreshing token with OAuth backend");
    
    // Use the OAuth API service to refresh token
    const response = await AuthAPI.refreshToken(token.refreshToken);
    const data = await response.json();

    if (response.ok) {
      return {
        ...token,
        accessToken: data.access,
        tokenExpires: Date.now() + (3600 * 1000), // Default to 1 hour
        error: undefined,
      };
    } else {
      throw new Error(data.error || "Token refresh failed");
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth(authOptions);
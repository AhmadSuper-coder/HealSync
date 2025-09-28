import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { AuthAPI } from "../../../lib/django-api/auth";
import { GoogleProfile, RefreshRequest } from "../../../types/auth";



export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "email-password",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // Validate email format
        if (!AuthAPI.validateEmail(credentials.email)) {
          throw new Error("Invalid email format");
        }

        try {
          // console.log("before hiting the emai login ")
          // const response = await AuthAPI.emailLogin({
          //   email: credentials.email,
          //   password: credentials.password,
          // });

          return {
            email: "ahmad@gmail.com",
            name: "ahmad raza",
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY0MjMwODY0LCJpYXQiOjE3NTkwNDY4NjQsImp0aSI6IjMzYTlmYWQ5OWRjMTQwZmViMTkxM2M3YjI5ZTU3YjQ5IiwidXNlcl9pZCI6IjMifQ.oEBjaYI3WVJS7ErtyEYGlbGQhTUrIkkPL_rlvBzh5f4",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY1MTY2NCwiaWF0IjoxNzU5MDQ2ODY0LCJqdGkiOiI3NmEwMmVmNDgxNGY0ZWQ4YTA1MmQzZjUwYTkzNjVmYSIsInVzZXJfaWQiOiIzIn0.sQisyGeQolWXMi_eJzGfOxg3gyzFCAfQgREf8q3T0OQ",
            tokenExpires: Date.now() + (360000 * 1000), // 1 hour
          };
        } catch (error) {
          console.error("Email login failed:", error);
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          console.log("Google sign-in for:", user.email);
          console.log("Google profile:", profile);

          // ✅ Prepare Google profile for OAuth API
          const googleProfile: GoogleProfile = {
            email: user.email!,
            name: user.name!,
            sub: account.providerAccountId,
            picture: user.image ?? undefined,
          };

          // ✅ Call OAuth API
          const djangoResponse = await AuthAPI.googleAuth(googleProfile);
          
          console.log("OAuth authentication successful:", djangoResponse);

          // ✅ Attach tokens to NextAuth `user` object
          user.accessToken = djangoResponse.access_token;
          user.refreshToken = djangoResponse.refresh_token;
          user.tokenExpires = Date.now() + djangoResponse.expires_in * 1000;
          user.userData = djangoResponse.user;
          user.created = djangoResponse.created;
          
          return true;
        } catch (error) {
          console.error("OAuth authentication failed:", error);
          return false;
        }
      } else if (account?.provider === "email-password") {
        // Email/password authentication is handled in the authorize function
        // Just return true here as the user object is already populated
        return true;
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
          userData: user.userData,
          created: user.created,
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
    console.log("Refreshing token with Django backend", token.refreshToken);
    
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
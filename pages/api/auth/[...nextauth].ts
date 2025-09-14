import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Mock Django API integration
async function authenticateWithDjango(googleProfile: any) {
  // This simulates calling Django backend at /auth/google/
  // In real implementation, you would make actual API call to Django
  console.log("Sending Google profile to Django:", googleProfile);
  
  // Mock Django response with JWT tokens
  return {
    access_token: "mock_django_access_token_" + Date.now(),
    refresh_token: "mock_django_refresh_token_" + Date.now(),
    doctor_id: "doc_" + googleProfile.sub,
    expires_in: 3600, // 1 hour
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-replace-in-production",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock_google_client_id_123456789.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_google_client_secret_abcdef123456",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Send Google profile to Django backend
          const djangoResponse = await authenticateWithDjango({
            email: user.email,
            name: user.name,
            sub: account.providerAccountId,
          });
          
          // Store Django tokens in user object
          user.accessToken = djangoResponse.access_token;
          user.refreshToken = djangoResponse.refresh_token;
          user.doctorId = djangoResponse.doctor_id;
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
          doctorId: user.doctorId,
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
      session.doctorId = token.doctorId;
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
    // Mock refresh token call to Django
    console.log("Refreshing token with Django refresh token:", token.refreshToken);
    
    // Simulate Django refresh token response
    const refreshedTokens = {
      access_token: "refreshed_mock_django_access_token_" + Date.now(),
      refresh_token: token.refreshToken, // Usually stays the same
      expires_in: 3600,
    };

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      tokenExpires: Date.now() + (refreshedTokens.expires_in * 1000),
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
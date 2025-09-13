import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    doctorId?: string;
    error?: string;
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    doctorId?: string;
    tokenExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    doctorId?: string;
    tokenExpires?: number;
    error?: string;
  }
}
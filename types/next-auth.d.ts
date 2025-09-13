import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    access_token?: string
    refresh_token?: string
    doctor_id?: string
  }

  interface JWT {
    access_token?: string
    refresh_token?: string
    doctor_id?: string
  }
}
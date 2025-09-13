import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Send profile to Django backend on first login
      if (account && user) {
        try {
          const response = await fetch(`${process.env.DJANGO_BACKEND_URL}/auth/google/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              sub: user.id,
            }),
          })
          
          if (response.ok) {
            const data = await response.json()
            token.access_token = data.access_token
            token.refresh_token = data.refresh_token
            token.doctor_id = data.doctor_id
          }
        } catch (error) {
          console.error('Error sending profile to Django:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // Only expose minimal user info to client
      // Access tokens stay server-side in JWT
      if (token.doctor_id) {
        session.doctor_id = token.doctor_id as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
}
// app/api/auth/auth.config.ts
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error("Missing Google client ID or secret");
}

// Extend the types for JWT and Session
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    provider?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile" // 'openid' is required for ID tokens
        }
      }
    }),
  ],
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        // console.log("Google account data in JWT callback:", account);
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.provider = token.provider;
      return session;
    },
    // Add this callback to redirect after sign-in
    async redirect({ url, baseUrl }) {
      // After NextAuth completes the OAuth flow, redirect to our Supabase callback
      if(url || baseUrl) {
        return `${baseUrl}/api/auth/supabase-callback`;
      }
      return `${baseUrl}/api/auth/supabase-callback`;
    }
  },
  // Custom pages to handle the flow
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  // debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
  secret: process.env.NEXTAUTH_SECRET, // Make sure this is set in your .env
};
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			// Store the ID token when signing in
			if (account?.id_token) {
				token.idToken = account.id_token;
			}
			if (account?.nonce) {
				token.nonce = account.nonce;
			}
			return token;
		},
		async session({ session }) {
			// Make ID token available in session
			return session;
		},
		async redirect({ url, baseUrl }) {
			// Redirect to Supabase callback after NextAuth authentication
			if (url.startsWith(baseUrl)) {
				return `${baseUrl}/api/auth/supabase-callback`;
			}
			return baseUrl;
		},
	},
	pages: {
		signIn: "/login",
		error: "/login",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};

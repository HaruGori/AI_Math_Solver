import Google from "@auth/core/providers/google";
import NextAuth, { type Session } from "next-auth";
import { type JWT } from "next-auth/jwt";

const authConfig = {
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	secret: process.env.AUTH_SECRET,
	callbacks: {
		session({ session, token }: { session: Session; token: JWT }) {
			if (token && session.user) {
				session.user.id = token.sub;
			}
			return session;
		},
	},
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

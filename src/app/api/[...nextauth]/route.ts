import { query } from "@/lib/db";
import { User } from "@/lib/types";
import { loginSchema } from "@/lib/validations/auth";
import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credential) {
        const parsed = loginSchema.safeParse(credential);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const { rows: existedAccounts } = await query<User>(
          "SELECT * FROM accounts WHERE email = $1",
          [email],
        );
        if (existedAccounts.length == 0) return null;

        const checked = await bcrypt.compare(
          password,
          existedAccounts[0].password_hash,
        );
        if (!checked) return null;

        const { rows: users } = await query<User>(
          "SELECT u.id, u.username, u.role, u.avatar_url FROM users u join accounts a on u.id = a.user_id WHERE a.id = $1",
          [existedAccounts[0].id],
        );
        if (users.length == 0) return null;

        const user = users[0];

        return {
          id: user.id,
          username: user.username,
          role: user.role,
          image: user.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const { handlers } = NextAuth(authOptions);

export const { GET, POST } = handlers;

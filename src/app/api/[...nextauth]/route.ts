import pool from "@/lib/db";
import { loginSchema } from "@/lib/schema";
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

        const { username, password } = parsed.data;

        console.log(username, password);

        const {rows} = await pool.query('SELECT * FROM accounts WHERE username = $1', [username]);
        if (rows.length == 0) return null;

        const account = rows[0]

        const checked = await bcrypt.compare(password, existedAccount.password);
        if (!checked) return null;

        const {rows: users} = await pool.query('SELECT u.id, u.username, u.role, u.avatar_url FROM users u join accounts a on u.id = a.user_id WHERE a.id = $1', [account.user_id]);
        if (users.length == 0) return null;

        const user = rows[0];

        return {
          id: user.id,
          name: user.name,
          role: account.role,
          image: user.avatarUrl,
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

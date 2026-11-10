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

        const account = await db.orm.public.Account.where({ username }).first();
        if (!account) return null;

        const checked = await bcrypt.compare(password, account.password);
        if (!checked) return null;

        const user = await db.orm.public.User.where({
          accountId: account.id,
        }).first();
        if (!user) return null;

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

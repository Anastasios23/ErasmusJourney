// /pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("CredentialsSignin");
        }
        // look up user in your database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          // NextAuth will redirect to /login?error=CredentialsSignin
          throw new Error("CredentialsSignin");
        }
        // verify password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) {
          throw new Error("CredentialsSignin");
        }
        // return the minimal user object
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
    // …other providers if you have them…
  ],

  pages: {
    // Redirect all sign-in and error flows back to your custom login page
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, persist id/role into the token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose those properties client-side via session.user
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative callbackUrls or same-origin
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        /* ignore invalid URLs */
      }
      return baseUrl;
    },
  },

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Cookie configuration
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.NEXTAUTH_URL_DOMAIN
            : undefined,
      },
    },
  },

  // Enable debug logs during development
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);

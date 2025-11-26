import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  // Note: Prisma adapter removed because we're using JWT strategy
  // For Google OAuth, users will be created in the authorize callback
  providers: [
    // Only include Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing credentials");
            return null;
          }

          console.log("Attempting login for:", credentials.email);

          const user = await prisma.users.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            console.error("User not found:", credentials.email);
            return null;
          }

          console.log("User found, verifying password");

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValid) {
            console.error("Invalid password for:", credentials.email);
            return null;
          }

          console.log("Login successful for:", credentials.email);
          console.log("Returning user object:", {
            id: user.id,
            email: user.email,
            role: user.role,
          });

          return {
            id: user.id,
            email: user.email!,
            role: user.role,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email!,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  // Debug mode for development
  debug: process.env.NODE_ENV === "development",
  // Enhanced error logging with better filtering
  logger: {
    error(code, metadata) {
      // Filter out client-side fetch errors to reduce noise
      if (code === "CLIENT_FETCH_ERROR") {
        console.warn(
          "NextAuth Client Fetch Error (this is usually harmless):",
          metadata?.message,
        );
        return;
      }
      console.error("NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("NextAuth Debug:", code, metadata);
      }
    },
  },
  // Add configuration to handle edge cases
  useSecureCookies: process.env.NODE_ENV === "production",
};

export default NextAuth(authOptions);

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma"; // Correctly import the shared prisma instance

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
<<<<<<< HEAD
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing credentials");
            throw new Error("CredentialsSignin");
          }

          console.log("Attempting login for:", credentials.email);

          // look up user in your database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.error("User not found:", credentials.email);
            throw new Error("CredentialsSignin");
          }

          console.log("User found, verifying password");

          // verify password
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValid) {
            console.error("Invalid password for:", credentials.email);
            throw new Error("CredentialsSignin");
          }

          console.log("Login successful for:", credentials.email);

          // return the minimal user object
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: `${user.firstName} ${user.lastName}`,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
=======
        if (!credentials?.email || !credentials.password) {
          throw new Error("Please enter an email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return user;
>>>>>>> origin/main
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
<<<<<<< HEAD
      // On sign-in, persist id/role into the token
=======
>>>>>>> origin/main
      if (user) {
        // @ts-ignore
        token.id = user.id;
<<<<<<< HEAD
        token.role = (user as any).role;
=======
        // @ts-ignore
        token.role = user.role;
>>>>>>> origin/main
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
<<<<<<< HEAD
        session.user.id = token.id as string;
        session.user.role = token.role as string;
=======
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
>>>>>>> origin/main
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
<<<<<<< HEAD

  // Cookie configuration - simplified for better compatibility
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Remove domain restriction for cloud environments
        domain: undefined,
      },
    },
  },

  // Enable debug logs for better troubleshooting
  debug: true,

  // Add error logging
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.log("NextAuth Debug:", code, metadata);
    },
  },
};

export default NextAuth(authOptions);
=======
});
>>>>>>> origin/main

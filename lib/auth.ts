import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

// Extend the default session type to include role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: "USER" | "ADMIN";
    };
  }

  interface User {
    id: string;
    email: string;
    role: "USER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
  }
}

export async function getServerAuthSession(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return await getServerSession(req, res, authOptions);
}

// Helper function to check if user is admin
export function isAdmin(session: any): boolean {
  return session?.user?.role === "ADMIN";
}

// Helper function to check if user is authenticated
export function isAuthenticated(session: any): boolean {
  return !!session?.user;
}

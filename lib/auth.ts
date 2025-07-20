import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export async function getServerAuthSession(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return getServerSession(req, res, authOptions);
}

export function isAdmin(session: any) {
  return session?.user?.role === "ADMIN" || session?.user?.role === "admin";
}

// Alternative if you prefer to use the session directly in API routes
export { authOptions } from "../pages/api/auth/[...nextauth]";

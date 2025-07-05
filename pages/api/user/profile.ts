import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Authentication temporarily disabled - allow all access
  // const session = await getServerSession(req, res, authOptions);

  if (req.method === "GET") {
    // Get user profile
    try {
      // In a real app, you'd fetch from your database
      // For now, return session data
      return res.status(200).json({
        name: session.user?.name,
        email: session.user?.email,
        phone: (session.user as any)?.phone || "",
        address: (session.user as any)?.address || "",
        bio: (session.user as any)?.bio || "",
        dateOfBirth: (session.user as any)?.dateOfBirth || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    // Update user profile
    try {
      const { name, phone, address, bio, dateOfBirth } = req.body;

      // Validate input
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: "Name is required" });
      }

      // In a real app, you'd update your database here
      // For demo purposes, we'll just return success
      // You would typically do something like:
      // await updateUser(session.user.id, { name, phone, address, bio, dateOfBirth });

      console.log("Profile update request:", {
        userId: session.user?.email,
        updates: { name, phone, address, bio, dateOfBirth },
      });

      return res.status(200).json({
        message: "Profile updated successfully",
        data: { name, phone, address, bio, dateOfBirth },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

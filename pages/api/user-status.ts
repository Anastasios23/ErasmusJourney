import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Test session
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({
        error: "No session found",
        message: "Please sign in to check user status",
      });
    }

    console.log("User status check for:", session.user.id);

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            formSubmissions: true,
          },
        },
      },
    });

    if (!dbUser) {
      // User doesn't exist - try to create them based on session data
      console.log("User not found in database, attempting to create...");

      try {
        const newUser = await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email || "",
            firstName: session.user.name?.split(" ")[0] || "Unknown",
            lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
            role: session.user.role || "USER",
          },
        });

        return res.status(201).json({
          status: "created",
          message: "User account was created successfully",
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
            formSubmissions: 0,
          },
          session: {
            userId: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role,
          },
        });
      } catch (createError) {
        console.error("Error creating user:", createError);
        return res.status(500).json({
          status: "error",
          message: "Could not create user account",
          error:
            createError instanceof Error
              ? createError.message
              : "Unknown error",
          session: {
            userId: session.user.id,
            email: session.user.email,
            name: session.user.name,
          },
        });
      }
    }

    // User exists
    res.status(200).json({
      status: "exists",
      message: "User account found in database",
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
        formSubmissions: dbUser._count.formSubmissions,
      },
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error("User status check failed:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to check user status",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}

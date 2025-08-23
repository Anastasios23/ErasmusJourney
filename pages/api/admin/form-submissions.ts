import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // Check if user is admin
  // const session = await getServerSession(req, res, authOptions);
  // if (!session?.user || session.user.role !== "ADMIN") {
  //   return res.status(403).json({ error: "Unauthorized" });
  // }

  if (req.method === "GET") {
    try {
      const { status } = req.query;

      let whereClause: any = {};
      if (status && typeof status === "string") {
        whereClause.status = status;
      }

      const submissions = await prisma.formSubmission.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Filter submissions that contain destination data (hostCity and hostCountry)
      const destinationSubmissions = submissions.filter((submission) => {
        const data = submission.data as any;
        return data.hostCity && data.hostCountry;
      });

      return res.status(200).json(destinationSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      return res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import DestinationDataService from "../../../src/services/destinationDataService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // AUTHENTICATION DISABLED - Comment out to re-enable
    // const session = await getServerSession(req, res, authOptions);
    // if (!session || !session.user?.email) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Authentication required"
    //   });
    // }

    // // For now, allow any authenticated user to be admin
    // // TODO: Implement proper admin role checking
    // const isAdmin = true; // session.user.role === 'ADMIN'
    // if (!isAdmin) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Admin access required"
    //   });
    // }

    // Mock session for disabled authentication
    const session = { user: { id: 'anonymous', email: 'admin@example.com' } };

    switch (req.method) {
      case "GET":
        return handleGetDestinations(req, res);
      case "POST":
        return handleCreateDestination(req, res, session.user.id || session.user.email);
      default:
        return res.status(405).json({
          success: false,
          message: "Method not allowed"
        });
    }
  } catch (error) {
    console.error("Admin destinations API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handleGetDestinations(req: NextApiRequest, res: NextApiResponse) {
  const { featured, withStudentData } = req.query;

  const destinations = await DestinationDataService.getAllDestinations({
    featured: featured === "true",
    withStudentData: withStudentData === "true",
  });

  // Return destinations array directly to match frontend expectations
  return res.status(200).json(destinations);
}

async function handleCreateDestination(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  const {
    name,
    city,
    country,
    description,
    imageUrl,
    climate,
    highlights,
    officialUniversities,
    generalInfo,
    featured,
  } = req.body;

  // Validate required fields
  if (!name || !city || !country || !description) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, city, country, description",
    });
  }

  const destination = await DestinationDataService.createDestination({
    name,
    city,
    country,
    description,
    imageUrl,
    climate,
    highlights,
    officialUniversities,
    generalInfo,
    featured,
    createdBy: userId,
  });

  return res.status(201).json({
    success: true,
    data: destination,
    message: "Destination created successfully",
  });
}

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import DestinationDataService from "../../../../src/services/destinationDataService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Destination ID is required",
    });
  }

  try {
    // AUTHENTICATION DISABLED - Comment out to re-enable
    // const session = await getServerSession(req, res, authOptions);

    switch (req.method) {
      case "GET":
        return handleGetDestination(req, res, id);
      case "PUT":
        // AUTHENTICATION DISABLED - Comment out to re-enable
        // if (!session || !session.user?.email) {
        //   return res.status(401).json({
        //     success: false,
        //     message: "Authentication required",
        //   });
        // }
        return handleUpdateDestination(req, res, id);
      case "DELETE":
        // AUTHENTICATION DISABLED - Comment out to re-enable
        // if (!session || !session.user?.email) {
        //   return res.status(401).json({
        //     success: false,
        //     message: "Authentication required",
        //   });
        // }
        return handleDeleteDestination(req, res, id);
      default:
        return res.status(405).json({
          success: false,
          message: "Method not allowed",
        });
    }
  } catch (error) {
    console.error("Destination API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handleGetDestination(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
) {
  const { withStudentData = "true" } = req.query;

  const destination = await DestinationDataService.getCompleteDestination(id);

  if (!destination) {
    return res.status(404).json({
      success: false,
      message: "Destination not found",
    });
  }

  // Return admin data only or complete data with student insights
  const responseData =
    withStudentData === "true"
      ? destination
      : {
          id: destination.id,
          name: destination.name,
          city: destination.city,
          country: destination.country,
          description: destination.description,
          imageUrl: destination.imageUrl,
          climate: destination.climate,
          highlights: destination.highlights,
          officialUniversities: destination.officialUniversities,
          generalInfo: destination.generalInfo,
          featured: destination.featured,
          active: destination.active,
        };

  return res.status(200).json({
    success: true,
    data: responseData,
  });
}

async function handleUpdateDestination(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
) {
  const updateData = req.body;

  const destination = await DestinationDataService.updateDestination(
    id,
    updateData,
  );

  return res.status(200).json({
    success: true,
    data: destination,
    message: "Destination updated successfully",
  });
}

async function handleDeleteDestination(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
) {
  // For now, we'll just deactivate instead of deleting
  const destination = await DestinationDataService.updateDestination(id, {
    active: false,
  });

  return res.status(200).json({
    success: true,
    data: destination,
    message: "Destination deactivated successfully",
  });
}

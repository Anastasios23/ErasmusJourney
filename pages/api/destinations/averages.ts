import { NextApiRequest, NextApiResponse } from "next";

// Mock averages data for destinations
const mockAverages = {
  berlin_germany: {
    accommodation: {
      averageRent: 850,
      rentRange: { min: 400, max: 1200 },
      popularTypes: {
        "Student Dormitory": 45,
        "Shared Apartment": 35,
        Studio: 20,
      },
    },
    livingCosts: {
      groceries: 250,
      transport: 81,
      entertainment: 150,
      total: 1331,
    },
    courses: {
      averageCount: 6,
      popularDepartments: [
        ["Computer Science", 15],
        ["Business", 12],
        ["Engineering", 10],
      ],
    },
    ratings: {
      overall: 4.5,
      university: 4.3,
      city: 4.7,
      accommodation: 4.2,
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { city, country } = req.query;

    if (!city || !country) {
      return res.status(400).json({
        message: "Missing required parameters: city and country",
      });
    }

    const key = `${city}_${country}`.toLowerCase();
    console.log(`Fetching averages for: ${key}`);

    const averages = mockAverages[key as keyof typeof mockAverages];

    if (!averages) {
      return res.status(404).json({
        message: "Averages not found for this destination",
        key: key,
      });
    }

    res.status(200).json(averages);
  } catch (error) {
    console.error("Error fetching averages:", error);
    res.status(500).json({
      message: "Failed to fetch averages",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

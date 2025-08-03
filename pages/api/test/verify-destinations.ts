import type { NextApiRequest, NextApiResponse } from "next";

// Simple destination data for testing
const testDestinations = [
  {
    id: "paris-france",
    city: "Paris",
    country: "France",
    name: "Paris, France",
    description: "The City of Light offers world-class education and rich cultural experiences.",
    imageUrl: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=400&fit=crop",
    costOfLiving: "high",
    averageRent: 650,
    language: "French",
    highlights: ["World-renowned universities", "Rich cultural heritage", "Excellent public transport"],
    universities: ["Sorbonne University", "Sciences Po", "École Normale Supérieure"]
  },
  {
    id: "barcelona-spain", 
    city: "Barcelona",
    country: "Spain",
    name: "Barcelona, Spain",
    description: "A vibrant Mediterranean city combining excellent business schools with beach culture.",
    imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=400&fit=crop",
    costOfLiving: "medium",
    averageRent: 800,
    language: "Spanish/Catalan",
    highlights: ["Top business schools", "Mediterranean lifestyle", "Innovative startup scene"],
    universities: ["ESADE Business School", "IESE Business School", "Universitat Pompeu Fabra"]
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const destinations = testDestinations.map(dest => ({
      ...dest,
      verified: true,
      testDataReady: true
    }));

    res.status(200).json({
      success: true,
      destinations,
      message: "Test destinations verified"
    });
  } catch (error) {
    console.error("Error verifying destinations:", error);
    res.status(500).json({
      error: "Failed to verify destinations",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

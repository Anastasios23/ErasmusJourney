import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      // For now, return mock partnership data since PartnershipTracking model is not yet available
      // In a real implementation, this would query the partnershipTracking table

      const mockPartnerships = [
        {
          id: "1",
          homeUniversityName: "University of Cyprus",
          partnerUniversityName: "Technical University of Berlin",
          partnerCity: "Berlin",
          partnerCountry: "Germany",
          agreementType: "ERASMUS",
          fieldOfStudy: "Computer Science",
          isActive: true,
          totalSubmissions: 15,
          averageRating: 4.3,
          averageAcademicRating: 4.5,
          lastSubmissionDate: new Date("2024-11-15"),
          needsAttention: false,
        },
        {
          id: "2",
          homeUniversityName: "University of Cyprus",
          partnerUniversityName: "Universidad Complutense Madrid",
          partnerCity: "Madrid",
          partnerCountry: "Spain",
          agreementType: "ERASMUS",
          fieldOfStudy: "Business Administration",
          isActive: true,
          totalSubmissions: 12,
          averageRating: 4.1,
          averageAcademicRating: 4.0,
          lastSubmissionDate: new Date("2024-10-22"),
          needsAttention: false,
        },
      ];

      res.status(200).json(mockPartnerships);
    } catch (error) {
      console.error("Error fetching partnerships:", error);
      res.status(500).json({ error: "Failed to fetch partnerships" });
    }
  } else if (req.method === "POST") {
    try {
      const {
        homeUniversityName,
        partnerUniversityName,
        partnerCity,
        partnerCountry,
        agreementType,
        fieldOfStudy,
        isActive,
      } = req.body;

      // Mock creation response
      const partnership = {
        id: Date.now().toString(),
        homeUniversityName,
        partnerUniversityName,
        partnerCity,
        partnerCountry,
        agreementType,
        fieldOfStudy,
        isActive: isActive ?? true,
        totalSubmissions: 0,
        averageRating: null,
        averageAcademicRating: null,
        lastSubmissionDate: null,
        needsAttention: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.status(201).json(partnership);
    } catch (error) {
      console.error("Error creating partnership:", error);
      res.status(500).json({ error: "Failed to create partnership" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

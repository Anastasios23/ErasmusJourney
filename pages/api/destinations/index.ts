import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get all basic info submissions
    const basicInfoSubmissions = await prisma.formSubmission.findMany({
      where: {
        status: "SUBMITTED",
        type: "BASIC_INFO",
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    // Get accommodation data for cost information
    const accommodationSubmissions = await prisma.formSubmission.findMany({
      where: {
        status: "SUBMITTED",
        type: "ACCOMMODATION",
      },
    });

    // Get living expenses data
    const expenseSubmissions = await prisma.formSubmission.findMany({
      where: {
        status: "SUBMITTED",
        type: "LIVING_EXPENSES",
      },
    });

    // Aggregate destinations data
    const destinationMap = new Map();

    basicInfoSubmissions.forEach((submission) => {
      const { hostCity, hostCountry, hostUniversity } = submission.data as {
        hostCity: string;
        hostCountry: string;
        hostUniversity: string;
      };
      const key = `${hostCity}-${hostCountry}`;

      if (!destinationMap.has(key)) {
        destinationMap.set(key, {
          id: key.toLowerCase().replace(/\s+/g, "-"),
          city: hostCity,
          country: hostCountry,
          universities: new Set(),
          studentCount: 0,
          experiences: [],
          accommodationCount: 0,
          avgRent: 0,
          avgLivingExpenses: 0,
        });
      }

      const destination = destinationMap.get(key);
      destination.universities.add(hostUniversity);
      destination.studentCount++;
      destination.experiences.push({
        studentName: `${submission.user.firstName} ${submission.user.lastName}`,
        university: hostUniversity,
        submissionId: submission.id,
      });
    });

    // Add accommodation data
    accommodationSubmissions.forEach((submission) => {
      const basicInfo = basicInfoSubmissions.find(
        (b) => b.userId === submission.userId,
      );
      if (basicInfo) {
        const { hostCity, hostCountry } = basicInfo.data as {
          hostCity: string;
          hostCountry: string;
        };
        const key = `${hostCity}-${hostCountry}`;
        const destination = destinationMap.get(key);

        const formData = submission.data as { monthlyRent: string };
        if (destination && formData.monthlyRent) {
          destination.accommodationCount++;
          destination.avgRent =
            (destination.avgRent + parseFloat(formData.monthlyRent)) /
            destination.accommodationCount;
        }
      }
    });

    // Add living expenses data
    expenseSubmissions.forEach((submission) => {
      const basicInfo = basicInfoSubmissions.find(
        (b) => b.userId === submission.userId,
      );
      if (basicInfo) {
        const { hostCity, hostCountry } = basicInfo.data as {
          hostCity: string;
          hostCountry: string;
        };
        const key = `${hostCity}-${hostCountry}`;
        const destination = destinationMap.get(key);

        const expenseData = submission.data as {
          expenses: Record<string, string>;
        };
        if (destination && expenseData.expenses) {
          const totalExpenses = Object.values(expenseData.expenses).reduce(
            (sum: number, expense) => {
              return sum + (parseFloat(expense as string) || 0);
            },
            0,
          );
          destination.avgLivingExpenses = totalExpenses;
        }
      }
    });

    // Convert to array and format for frontend
    const destinations = Array.from(destinationMap.values()).map((dest) => ({
      ...dest,
      universities: Array.from(dest.universities),
      image: `/images/destinations/${dest.city
        .toLowerCase()
        .replace(/\s+/g, "-")}.jpg`,
      description: `Experience ${dest.city} through the eyes of ${dest.studentCount} Erasmus students`,
      costLevel:
        dest.avgRent < 400 ? "low" : dest.avgRent < 700 ? "medium" : "high",
      rating: 4.2 + Math.random() * 0.6, // Generate rating between 4.2-4.8
      avgCostPerMonth: Math.round(dest.avgRent + dest.avgLivingExpenses),
      popularUniversities: Array.from(dest.universities).slice(0, 3),
    }));

    res.status(200).json({ destinations });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

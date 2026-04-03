import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import {
  calculateFormSubmissionLivingExpensesTotal,
  sanitizeFormSubmissionLivingExpensesData,
} from "../../../src/lib/formSubmissionLivingExpenses";

const LIVING_EXPENSES_TYPES = ["LIVING_EXPENSES", "living-expenses"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { city, country } = req.query;

  if (!city || !country) {
    return res.status(400).json({ error: "City and country are required" });
  }

  try {
    // Get living expenses submissions for this destination
    const submissions = await prisma.form_submissions.findMany({
      where: {
        type: {
          in: LIVING_EXPENSES_TYPES,
        },
        OR: [
          {
            AND: [
              {
                data: {
                  path: ["destination", "city"],
                  string_contains: city as string,
                },
              },
              {
                data: {
                  path: ["destination", "country"],
                  string_contains: country as string,
                },
              },
            ],
          },
          {
            hostCity: {
              equals: city as string,
              mode: "insensitive",
            },
            hostCountry: {
              equals: country as string,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        data: true,
        createdAt: true,
      },
    });

    if (submissions.length === 0) {
      return res.status(200).json({
        city,
        country,
        avgAccommodation: 0,
        avgFood: 0,
        avgTransport: 0,
        avgEntertainment: 0,
        totalMonthly: 0,
        currency: "EUR",
        sampleSize: 0,
        lastUpdated: new Date(),
      });
    }

    // Process submissions to calculate averages
    let accommodationSum = 0;
    let foodSum = 0;
    let transportSum = 0;
    let entertainmentSum = 0;
    let totalMonthlySum = 0;
    let validSubmissions = 0;

    submissions.forEach((submission) => {
      const data = sanitizeFormSubmissionLivingExpensesData(submission.data);
      const total = calculateFormSubmissionLivingExpensesTotal(data);

      if (total > 0) {
        accommodationSum += data.rent || 0;
        foodSum += data.food || 0;
        transportSum += data.transport || 0;
        entertainmentSum += data.social || 0;
        totalMonthlySum += total;
        validSubmissions++;
      }
    });

    if (validSubmissions === 0) {
      return res.status(200).json({
        city,
        country,
        avgAccommodation: 0,
        avgFood: 0,
        avgTransport: 0,
        avgEntertainment: 0,
        totalMonthly: 0,
        currency: "EUR",
        sampleSize: 0,
        lastUpdated: new Date(),
      });
    }

    // Calculate averages
    const avgAccommodation = Math.round(accommodationSum / validSubmissions);
    const avgFood = Math.round(foodSum / validSubmissions);
    const avgTransport = Math.round(transportSum / validSubmissions);
    const avgEntertainment = Math.round(entertainmentSum / validSubmissions);
    const totalMonthly = Math.round(totalMonthlySum / validSubmissions);

    // Get the most recent submission date
    const lastUpdated = submissions.reduce((latest, sub) => {
      return sub.createdAt > latest ? sub.createdAt : latest;
    }, submissions[0].createdAt);

    const response = {
      city,
      country,
      avgAccommodation,
      avgFood,
      avgTransport,
      avgEntertainment,
      totalMonthly,
      currency: "EUR", // Could be dynamic based on country
      sampleSize: validSubmissions,
      lastUpdated,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching destination costs:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

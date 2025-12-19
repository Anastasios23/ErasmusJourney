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
    const {
      featured,
      country,
      orderBy = "students",
      order = "desc",
      limit = 100,
    } = req.query;

    // 1. Fetch Aggregated Statistics from ErasmusExperience (Real-time SQL)
    // We use queryRaw because we need to aggregate data stored in JSON fields
    const stats: any[] = await prisma.$queryRaw`
      SELECT 
        "hostCity" as city, 
        "hostCountry" as country,
        COUNT(*)::int as "submissionCount",
        AVG(CAST(COALESCE("experience"->>'overallRating', '0') AS NUMERIC)) as "averageRating",
        AVG(
          CAST(
            COALESCE(
              "livingExpenses"->>'total', 
              "livingExpenses"->>'totalMonthlyBudget', 
              '0'
            ) AS NUMERIC
          )
        ) as "averageCost"
      FROM erasmus_experiences
      WHERE (status = 'SUBMITTED' OR status = 'APPROVED')
        AND "isComplete" = true
        AND "hostCity" IS NOT NULL
        AND "hostCountry" IS NOT NULL
      GROUP BY "hostCity", "hostCountry"
    `;

    // 2. Fetch Destination Metadata (images, descriptions)
    const dbDestinations = await prisma.destinations.findMany({
      where: {
        status: "published"
      }
    });

    // 3. Merge Aggregated Stats with Metadata
    let integratedDestinations = stats.map(stat => {
      // Find matching destination in DB (case-insensitive)
      const metadata = dbDestinations.find(d => 
        d.city.toLowerCase() === stat.city.toLowerCase() && 
        d.country.toLowerCase() === stat.country.toLowerCase()
      );

      const name = metadata?.name || `${stat.city}, ${stat.country}`;
      const slug = metadata?.slug || `${stat.city.toLowerCase().replace(/ /g, '-')}-${stat.country.toLowerCase().replace(/ /g, '-')}`;

      return {
        id: metadata?.id || `virtual-${stat.city}-${stat.country}`,
        name: name,
        city: stat.city,
        country: stat.country,
        description: metadata?.description || `Discover ${stat.city} through ${stat.submissionCount} student stories.`,
        imageUrl: metadata?.imageUrl || `/images/destinations/${stat.city.toLowerCase().replace(/ /g, '-')}.jpg`,
        featured: metadata?.featured || false,
        slug: slug,
        submissionCount: stat.submissionCount,
        averageRating: parseFloat(parseFloat(stat.averageRating || 0).toFixed(1)),
        averageCost: Math.round(parseFloat(stat.averageCost || 0)),
        lastUpdated: metadata?.updatedAt || new Date().toISOString(),
      };
    });

    // 4. Add "Empty" Meta-only Destinations (optional, if we want to show destinations with 0 submissions)
    dbDestinations.forEach(dest => {
      const exists = integratedDestinations.some(d => 
        d.city.toLowerCase() === dest.city.toLowerCase() && 
        d.country.toLowerCase() === dest.country.toLowerCase()
      );
      
      if (!exists) {
        integratedDestinations.push({
          id: dest.id,
          name: dest.name,
          city: dest.city,
          country: dest.country,
          description: dest.description || "",
          imageUrl: dest.imageUrl || `/images/destinations/${dest.city.toLowerCase().replace(/ /g, '-')}.jpg`,
          featured: dest.featured,
          slug: dest.slug,
          submissionCount: 0,
          averageRating: 0.0,
          averageCost: 0,
          lastUpdated: dest.updatedAt.toISOString(),
        });
      }
    });

    // 5. Apply Filters
    if (featured === "true") {
      integratedDestinations = integratedDestinations.filter(d => d.featured);
    }

    if (country && country !== "all") {
      integratedDestinations = integratedDestinations.filter(d => 
        d.country.toLowerCase() === (country as string).toLowerCase()
      );
    }

    // 6. Apply Sorting
    integratedDestinations.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (orderBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "students":
          aValue = a.submissionCount;
          bValue = b.submissionCount;
          break;
        case "rating":
          aValue = a.averageRating;
          bValue = b.averageRating;
          break;
        case "cost":
          aValue = a.averageCost;
          bValue = b.averageCost;
          break;
        case "updated":
          aValue = new Date(a.lastUpdated).getTime();
          bValue = new Date(b.lastUpdated).getTime();
          break;
        default:
          aValue = a.submissionCount;
          bValue = b.submissionCount;
      }

      if (order === "desc") {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // 7. Apply Limit
    const limitNum = parseInt(limit as string) || 100;
    const result = integratedDestinations.slice(0, limitNum);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching integrated destinations:", error);
    res.status(500).json({
      message: "Failed to fetch destinations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

